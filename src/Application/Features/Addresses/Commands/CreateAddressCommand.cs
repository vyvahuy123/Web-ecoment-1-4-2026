using Application.Features.Addresses.DTOs;
using Application.Features.Addresses.Mapper;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Addresses.Commands;

public record CreateAddressCommand(
    Guid UserId,
    string FullName, string Phone,
    string Province, string District,
    string Ward, string Street,
    bool IsDefault) : IRequest<AddressDto>;

public class CreateAddressCommandHandler : IRequestHandler<CreateAddressCommand, AddressDto>
{
    private readonly IUnitOfWork _uow;
    public CreateAddressCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<AddressDto> Handle(CreateAddressCommand request, CancellationToken ct)
    {
        if (request.IsDefault)
        {
            var existing = await _uow.Addresses.GetDefaultByUserIdAsync(request.UserId, ct);
            existing?.UnsetDefault();

        }

        var address = Address.Create( // dùng factory method
            request.UserId,
            request.FullName,
            request.Phone,
            request.Province,
            request.District,
            request.Ward,
            request.Street,
            request.IsDefault);

        _uow.Addresses.Add(address);
        await _uow.SaveChangesAsync(ct);
        return AddressMapper.ToDto(address);
    }
}