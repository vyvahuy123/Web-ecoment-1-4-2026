using Domain.Interfaces;
using MediatR;

namespace Application.Features.Addresses.Commands;

public record DeleteAddressCommand(Guid UserId, Guid AddressId) : IRequest<Unit>;

public class DeleteAddressCommandHandler : IRequestHandler<DeleteAddressCommand, Unit>
{
    private readonly IUnitOfWork _uow;
    public DeleteAddressCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Unit> Handle(DeleteAddressCommand request, CancellationToken ct)
    {
        var address = await _uow.Addresses.GetByIdAsync(request.AddressId)
            ?? throw new Exception("Address not found.");

        if (address.UserId != request.UserId)
            throw new Exception("Forbidden.");

        address.Delete();
        _uow.Addresses.Update(address);
        await _uow.SaveChangesAsync(ct);
        return Unit.Value;
    }
}