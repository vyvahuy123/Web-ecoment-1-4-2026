using Domain.Interfaces;
using MediatR;

namespace Application.Features.Payments.Commands;

public record ConfirmVNPayCommand(Guid PaymentId, string TransactionId) : IRequest;

public class ConfirmVNPayCommandHandler : IRequestHandler<ConfirmVNPayCommand>
{
    private readonly IUnitOfWork _uow;
    public ConfirmVNPayCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(ConfirmVNPayCommand request, CancellationToken ct)
    {
        var payment = await _uow.Payments.GetByIdAsync(request.PaymentId, ct)
            ?? throw new Exception("Payment not found.");

        payment.MarkPaid(request.TransactionId, "VNPay callback confirmed");

        // Cập nhật luôn Order
        var order = await _uow.Orders.GetByIdAsync(payment.OrderId, ct);
        order?.MarkPaid();

        _uow.Payments.Update(payment);
        if (order is not null) _uow.Orders.Update(order);

        await _uow.SaveChangesAsync(ct);
    }
}