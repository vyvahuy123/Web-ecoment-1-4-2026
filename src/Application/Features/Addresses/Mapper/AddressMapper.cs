using Application.Features.Addresses.DTOs;
using Domain.Entities;

namespace Application.Features.Addresses.Mapper;

public static class AddressMapper
{
    public static AddressDto ToDto(Address a) => new()
    {
        Id = a.Id,
        FullName = a.FullName,
        Phone = a.Phone,
        Street = a.Street,
        Ward = a.Ward,
        District = a.District,
        Province = a.Province,
        IsDefault = a.IsDefault
    };
}