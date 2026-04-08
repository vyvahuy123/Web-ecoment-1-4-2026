using Application.Features.Vouchers.DTOs;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Vouchers.Queries;

public record ValidateVoucherQuery(string Code, Guid UserId, decimal OrderAmount) : IRequest<ValidateVoucherDto>;

public class ValidateVoucherQueryHandler
{
    private readonly IUnitOfWork _uow;
    public ValidateVoucherQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ValidateVoucherDto> Handle(ValidateVoucherQuery request, CancellationToken ct)
    {
        var voucher = await _uow.Vouchers.GetByCodeAsync(request.Code, ct);

        if (voucher is null)
            return new() { IsValid = false, Message = "Voucher không tồn tại." };

        if (!voucher.IsValid(request.OrderAmount, DateTime.UtcNow))
            return new() { IsValid = false, Message = "Voucher không hợp lệ hoặc đã hết hạn." };

        var usedByUser = await _uow.VoucherUsages.CountByUserAndVoucherAsync(request.UserId, voucher.Id, ct);
        if (usedByUser >= voucher.MaxUsagePerUser)
            return new() { IsValid = false, Message = "Bạn đã dùng hết lượt voucher này." };

        var discount = voucher.CalculateDiscount(request.OrderAmount); // dùng method của entity

        return new() { IsValid = true, DiscountAmount = discount, Message = "Voucher hợp lệ." };
    }
}