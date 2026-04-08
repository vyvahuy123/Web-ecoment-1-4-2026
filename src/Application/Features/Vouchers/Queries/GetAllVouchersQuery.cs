using Application.Features.Vouchers.DTOs;
using Application.Features.Vouchers.Mapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Vouchers.Queries;

public record GetAllVouchersQuery(int Page = 1, int PageSize = 50) : IRequest<List<VoucherDto>>;

public class GetAllVouchersQueryHandler : IRequestHandler<GetAllVouchersQuery, List<VoucherDto>>
{
    private readonly IUnitOfWork _uow;
    public GetAllVouchersQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<List<VoucherDto>> Handle(GetAllVouchersQuery request, CancellationToken ct)
    {
        var (items, _) = await _uow.Vouchers.GetPagedAsync(request.Page, request.PageSize, ct);
        return items.Select(VoucherMapper.ToDto).ToList();
    }
}