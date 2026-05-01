using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain.Enums;
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
        RuleFor(x => x.Items).NotEmpty().WithMessage("��n h�ng ph?i c� �t nh?t 1 s?n ph?m.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(x => x.ProductId).NotEmpty();
            item.RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("S? l�?ng ph?i l?n h�n 0.");
        });
    }
}

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, OrderDto>
{
    private readonly IUnitOfWork _uow;
    private readonly INotificationSender _notifSender;
    public CreateOrderCommandHandler(IUnitOfWork uow, INotificationSender notifSender)
    {
        _uow = uow;
        _notifSender = notifSender;
    }

    public async Task<OrderDto> Handle(CreateOrderCommand req, CancellationToken ct)
    {
        // L?y �?a ch? giao h�ng
        var address = await _uow.Addresses.GetByIdAsync(req.ShippingAddressId, ct)
            ?? throw new NotFoundException(nameof(Address), req.ShippingAddressId);

        // T�nh ti?n h�ng
        decimal subTotal = 0;
        var orderItems = new List<(Product product, int quantity)>();

        foreach (var item in req.Items)
        {
            var product = await _uow.Products.GetByIdAsync(item.ProductId, ct)
                ?? throw new NotFoundException(nameof(Product), item.ProductId);

            if (product.Stock < item.Quantity)
                throw new ValidationException(new[] {
                    new FluentValidation.Results.ValidationFailure(
                        "Stock", $"S?n ph?m '{product.Name}' kh�ng �? h�ng.")
                });

            subTotal += product.Price * item.Quantity;
            orderItems.Add((product, item.Quantity));
        }

        // X? l? voucher
        Voucher? voucher = null;
        decimal discountAmount = 0;
        if (!string.IsNullOrWhiteSpace(req.VoucherCode))
        {
            voucher = await _uow.Vouchers.GetByCodeAsync(req.VoucherCode, ct)
                ?? throw new NotFoundException(nameof(Voucher), req.VoucherCode);

            if (!voucher.IsValid(subTotal, DateTime.UtcNow))
                throw new ValidationException(new[] {
                    new FluentValidation.Results.ValidationFailure("VoucherCode", "Voucher kh�ng h?p l? ho?c �? h?t h?n.")
                });

            discountAmount = voucher.CalculateDiscount(subTotal);
        }

        // T?o m? ��n h�ng
        var orderCode = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        // T?o ��n h�ng
        var order = Order.Create(
            orderCode, req.UserId, address,
            subTotal, shippingFee: 30000,
            discountAmount, req.PaymentMethod,
            voucher?.Id, voucher?.Code, req.Note);

        // Th�m items + tr? t?n kho
        foreach (var (product, quantity) in orderItems)
        {
            order.AddItem(OrderItem.Create(order.Id, product, quantity));
            product.AdjustStock(-quantity);
            _uow.Products.Update(product);
        }

        // Ghi l?ch s? d�ng voucher
        if (voucher != null)
        {
            voucher.IncrementUsage();
            _uow.Vouchers.Update(voucher);
            _uow.VoucherUsages.Add(VoucherUsage.Create(voucher.Id, req.UserId, order.Id, discountAmount));
        }

        _uow.Orders.Add(order);

        // Tao payment record
        var payment = Payment.Create(order.Id, req.PaymentMethod, order.TotalAmount);
        _uow.Payments.Add(payment);
        await _uow.SaveChangesAsync(ct);

        await _notifSender.SendAsync(req.UserId.ToString(), new
        {
            type = "ORDER_CREATED",
            message = $"Don hang {order.OrderCode} da duoc tao thanh cong.",
            orderId = order.Id,
            orderCode = order.OrderCode
        });
        // Push notification cho admins
        var admins = await _uow.Users.GetAdminsAsync(ct);
        foreach (var admin in admins)
        {
            await _notifSender.SendAsync(admin.Id.ToString(), new
            {
                type = "NEW_ORDER",
                message = $"Don hang moi {order.OrderCode} vua duoc dat.",
                orderId = order.Id,
                orderCode = order.OrderCode
            });
        }

        return OrderMapper.ToDto(order);
    }
}
