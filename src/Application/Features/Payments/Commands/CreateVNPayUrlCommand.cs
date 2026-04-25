using Application.Interfaces;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Features.Payments.Commands;

public record CreateVNPayUrlCommand(Guid OrderId, HttpContext HttpContext) : IRequest<string>;

public class CreateVNPayUrlCommandHandler : IRequestHandler<CreateVNPayUrlCommand, string>
{
    private readonly IUnitOfWork _uow;
    private readonly IVNPayService _vnpay;

    public CreateVNPayUrlCommandHandler(IUnitOfWork uow, IVNPayService vnpay)
    {
        _uow = uow;
        _vnpay = vnpay;
    }

    public async Task<string> Handle(CreateVNPayUrlCommand request, CancellationToken ct)
    {
        var order = await _uow.Orders.GetByIdAsync(request.OrderId, ct)
            ?? throw new Exception("Order not found.");

        var payment = await _uow.Payments.GetByOrderIdAsync(request.OrderId, ct);
        if (payment is null)
        {
            payment = Domain.Entities.Payment.Create(
                request.OrderId,
                Domain.Enums.PaymentMethod.VNPay,
                order.TotalAmount);
            _uow.Payments.Add(payment);
            await _uow.SaveChangesAsync(ct);
        }

        var url = _vnpay.CreatePaymentUrl(new VNPayRequest
        {
            PaymentId = payment.Id,
            OrderCode = order.OrderCode,
            Amount = order.TotalAmount,
            OrderInfo = $"Thanh toan don hang {order.OrderCode}",
        }, request.HttpContext);

        return url;
    }
}
