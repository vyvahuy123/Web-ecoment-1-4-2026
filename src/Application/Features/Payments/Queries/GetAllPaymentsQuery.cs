// Application/Features/Payments/Queries/GetAllPaymentsQuery.cs
using Application.Common;
using Application.Features.Payments.DTOs;
using Application.Features.Payments.Mapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Payments.Queries;

public record GetAllPaymentsQuery(int Page, int PageSize)
    : IRequest<PagedResult<PaymentDto>>;

public class GetAllPaymentsQueryHandler
    : IRequestHandler<GetAllPaymentsQuery, PagedResult<PaymentDto>>
{
    private readonly IUnitOfWork _uow;

    public GetAllPaymentsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<PagedResult<PaymentDto>> Handle(
        GetAllPaymentsQuery req,
        CancellationToken ct)
    {
        var (items, total) = await _uow.Payments.GetPagedAsync(req.Page, req.PageSize, ct);

        return new PagedResult<PaymentDto>(
            items.Select(PaymentMapper.ToDto),
            total,
            req.Page,
            req.PageSize);
    }
}