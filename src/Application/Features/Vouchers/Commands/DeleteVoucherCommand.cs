using Domain.Interfaces;
using MediatR;

namespace Application.Features.Vouchers.Commands;

public record DeleteVoucherCommand(Guid Id) : IRequest;

public class DeleteVoucherCommandHandler : IRequestHandler<DeleteVoucherCommand>
{
    private readonly IUnitOfWork _uow;
    public DeleteVoucherCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(DeleteVoucherCommand request, CancellationToken ct)
    {
        var voucher = await _uow.Vouchers.GetByIdAsync(request.Id, ct)
            ?? throw new Exception("Voucher not found.");
        voucher.Delete();
        _uow.Vouchers.Update(voucher);
        await _uow.SaveChangesAsync(ct);
    }
}
