using Application.Features.Vouchers.DTOs;
using Application.Features.Vouchers.Mapper;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Vouchers.Commands;

public record UpdateVoucherCommand(
    Guid Id,
    string Code,
    VoucherType Type,
    decimal DiscountValue,
    int TotalQuantity,
    DateTime StartDate,
    DateTime EndDate,
    decimal MinOrderAmount = 0,
    decimal? MaxDiscountAmount = null,
    int MaxUsagePerUser = 1,
    bool IsActive = true,
    string? Description = null) : IRequest<VoucherDto>;

public class UpdateVoucherCommandHandler : IRequestHandler<UpdateVoucherCommand, VoucherDto>
{
    private readonly IUnitOfWork _uow;
    public UpdateVoucherCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<VoucherDto> Handle(UpdateVoucherCommand request, CancellationToken ct)
    {
        var voucher = await _uow.Vouchers.GetByIdAsync(request.Id, ct)
            ?? throw new Exception("Voucher not found.");

        voucher.Update(
            request.Code, request.Type, request.DiscountValue, request.TotalQuantity,
            request.StartDate, request.EndDate, request.MinOrderAmount,
            request.MaxDiscountAmount, request.MaxUsagePerUser, request.IsActive, request.Description);

        _uow.Vouchers.Update(voucher);
        await _uow.SaveChangesAsync(ct);
        return VoucherMapper.ToDto(voucher);
    }
}
