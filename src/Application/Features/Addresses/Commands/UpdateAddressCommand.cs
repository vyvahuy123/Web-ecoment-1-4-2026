using Application.Common.Exceptions;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Addresses.Commands;

public record UpdateAddressCommand(
    Guid UserId, Guid AddressId,
    string FullName, string Phone,
    string Province, string District,
    string Ward, string Street,
    bool IsDefault) : IRequest;

public class UpdateAddressCommandHandler
{
    private readonly IUnitOfWork _uow;
    public UpdateAddressCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(UpdateAddressCommand request, CancellationToken ct)
    {
        var address = await _uow.Addresses.GetByIdAsync(request.AddressId)
            ?? throw new Exception("Address not found.");

        if (address.UserId != request.UserId)
            throw new Exception("Forbidden.");

        if (request.IsDefault && !address.IsDefault)
        {
            var current = await _uow.Addresses.GetDefaultByUserIdAsync(request.UserId, ct);
            current?.UnsetDefault();
        }

        address.Update( // dùng method của entity
            request.FullName,
            request.Phone,
            request.Province,
            request.District,
            request.Ward,
            request.Street);

        if (request.IsDefault) address.SetAsDefault();
        _uow.Addresses.Update(address);
        await _uow.SaveChangesAsync(ct);
    }
}