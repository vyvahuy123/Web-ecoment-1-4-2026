using Domain.Interfaces;
using MediatR;

namespace Application.Features.Payments.Commands;

public record RefundPaymentCommand(Guid PaymentId, decimal RefundAmount, string Reason) : IRequest;

public class RefundPaymentCommandHandler
{
    private readonly IUnitOfWork _uow;
    public RefundPaymentCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(RefundPaymentCommand request, CancellationToken ct)
    {
        var payment = await _uow.Payments.GetByIdAsync(request.PaymentId, ct)
            ?? throw new Exception("Payment not found.");

        payment.Refund(request.RefundAmount, request.Reason);

        _uow.Payments.Update(payment);
        await _uow.SaveChangesAsync(ct);
    }
}