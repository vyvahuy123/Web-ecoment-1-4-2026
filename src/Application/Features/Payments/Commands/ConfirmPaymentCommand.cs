using Domain.Interfaces;
using MediatR;

namespace Application.Features.Payments.Commands;

public record ConfirmPaymentCommand(Guid PaymentId, string? TransactionId, string? GatewayResponse = null) : IRequest;

public class ConfirmPaymentCommandHandler
{
    private readonly IUnitOfWork _uow;
    public ConfirmPaymentCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(ConfirmPaymentCommand request, CancellationToken ct)
    {
        var payment = await _uow.Payments.GetByIdAsync(request.PaymentId, ct)
            ?? throw new Exception("Payment not found.");

        payment.MarkPaid(request.TransactionId, request.GatewayResponse);

        _uow.Payments.Update(payment);
        await _uow.SaveChangesAsync(ct);
    }
}