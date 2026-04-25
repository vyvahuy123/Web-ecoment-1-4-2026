using Application.Features.Addresses.DTOs;
using Application.Features.Addresses.Mapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Addresses.Queries;

public record GetMyAddressesQuery(Guid UserId) : IRequest<List<AddressDto>>;

public class GetMyAddressesQueryHandler : IRequestHandler<GetMyAddressesQuery, List<AddressDto>>
{
    private readonly IUnitOfWork _uow;
    public GetMyAddressesQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<List<AddressDto>> Handle(GetMyAddressesQuery request, CancellationToken ct)
    {
        var addresses = await _uow.Addresses.GetByUserIdAsync(request.UserId, ct);
        return addresses.Select(AddressMapper.ToDto).ToList();
    }
}