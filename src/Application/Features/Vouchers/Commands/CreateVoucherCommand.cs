using Application.Features.Vouchers.DTOs;
using Application.Features.Vouchers.Mapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Vouchers.Commands;

public record CreateVoucherCommand(
    string Code,
    VoucherType Type,
    decimal DiscountValue,
    int TotalQuantity,
    DateTime StartDate,
    DateTime EndDate,
    decimal MinOrderAmount = 0,
    decimal? MaxDiscountAmount = null,
    int MaxUsagePerUser = 1,
    string? Description = null) : IRequest<VoucherDto>;

public class CreateVoucherCommandHandler : IRequestHandler<CreateVoucherCommand, VoucherDto>
{
    private readonly IUnitOfWork _uow;
    public CreateVoucherCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<VoucherDto> Handle(CreateVoucherCommand request, CancellationToken ct)
    {
        if (await _uow.Vouchers.ExistsByCodeAsync(request.Code, ct))
            throw new Exception($"Voucher code '{request.Code}' already exists.");

        var voucher = Voucher.Create(
            request.Code,
            request.Type,
            request.DiscountValue,
            request.TotalQuantity,
            request.StartDate,
            request.EndDate,
            request.MinOrderAmount,
            request.MaxDiscountAmount,
            request.MaxUsagePerUser,
            request.Description);

        _uow.Vouchers.Add(voucher);
        await _uow.SaveChangesAsync(ct);
        return VoucherMapper.ToDto(voucher);
    }
}