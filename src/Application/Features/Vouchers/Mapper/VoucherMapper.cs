using Application.Features.Vouchers.DTOs;
using Domain.Entities;

namespace Application.Features.Vouchers.Mapper;

public static class VoucherMapper
{
    public static VoucherDto ToDto(Voucher v) => new()
    {
        Id = v.Id,
        Code = v.Code,
        Type = v.Type,
        DiscountValue = v.DiscountValue,
        MaxDiscountAmount = v.MaxDiscountAmount,
        MinOrderAmount = v.MinOrderAmount,
        TotalQuantity = v.TotalQuantity,
        UsedQuantity = v.UsedQuantity,
        MaxUsagePerUser = v.MaxUsagePerUser,
        StartDate = v.StartDate,
        EndDate = v.EndDate,
        IsActive = v.IsActive,
        Description = v.Description
    };
}