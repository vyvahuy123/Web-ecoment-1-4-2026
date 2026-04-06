using Application.Common.Exceptions;
using Application.Features.Orders.DTOs;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using FluentValidation;
using MediatR;
using ValidationException = Application.Common.Exceptions.ValidationException;

namespace Application.Features.Orders.Commands;

public record CreateOrderCommand(
    Guid UserId,
    Guid ShippingAddressId,
    PaymentMethod PaymentMethod,
    List<OrderItemRequest> Items,
    string? VoucherCode = null,
    string? Note = null
) : IRequest<OrderDto>;

public record OrderItemRequest(Guid ProductId, int Quantity);

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ShippingAddressId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Đơn hàng phải có ít nhất 1 sản phẩm.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(x => x.ProductId).NotEmpty();
            item.RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Số lượng phải lớn hơn 0.");
        });
    }
}

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, OrderDto>
{
    private readonly IUnitOfWork _uow;
    public CreateOrderCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<OrderDto> Handle(CreateOrderCommand req, CancellationToken ct)
    {
        // Lấy địa chỉ giao hàng
        var address = await _uow.Addresses.GetByIdAsync(req.ShippingAddressId, ct)
            ?? throw new NotFoundException(nameof(Address), req.ShippingAddressId);

        // Tính tiền hàng
        decimal subTotal = 0;
        var orderItems = new List<(Product product, int quantity)>();

        foreach (var item in req.Items)
        {
            var product = await _uow.Products.GetByIdAsync(item.ProductId, ct)
                ?? throw new NotFoundException(nameof(Product), item.ProductId);

            if (product.Stock < item.Quantity)
                throw new ValidationException(new[] {
                    new FluentValidation.Results.ValidationFailure(
                        "Stock", $"Sản phẩm '{product.Name}' không đủ hàng.")
                });

            subTotal += product.Price * item.Quantity;
            orderItems.Add((product, item.Quantity));
        }

        // Xử lý voucher
        Voucher? voucher = null;
        decimal discountAmount = 0;
        if (!string.IsNullOrWhiteSpace(req.VoucherCode))
        {
            voucher = await _uow.Vouchers.GetByCodeAsync(req.VoucherCode, ct)
                ?? throw new NotFoundException(nameof(Voucher), req.VoucherCode);

            if (!voucher.IsValid(subTotal, DateTime.UtcNow))
                throw new ValidationException(new[] {
                    new FluentValidation.Results.ValidationFailure("VoucherCode", "Voucher không hợp lệ hoặc đã hết hạn.")
                });

            discountAmount = voucher.CalculateDiscount(subTotal);
        }

        // Tạo mã đơn hàng
        var orderCode = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        // Tạo đơn hàng
        var order = Order.Create(
            orderCode, req.UserId, address,
            subTotal, shippingFee: 30000,
            discountAmount, req.PaymentMethod,
            voucher?.Id, voucher?.Code, req.Note);

        // Thêm items + trừ tồn kho
        foreach (var (product, quantity) in orderItems)
        {
            order.AddItem(OrderItem.Create(order.Id, product, quantity));
            product.AdjustStock(-quantity);
            _uow.Products.Update(product);
        }

        // Ghi lịch sử dùng voucher
        if (voucher != null)
        {
            voucher.IncrementUsage();
            _uow.Vouchers.Update(voucher);
            _uow.VoucherUsages.Add(VoucherUsage.Create(voucher.Id, req.UserId, order.Id, discountAmount));
        }

        _uow.Orders.Add(order);
        await _uow.SaveChangesAsync(ct);
        return OrderMapper.ToDto(order);
    }
}