using Application.Common;
using Application.Features.Orders.DTOs;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Orders.Queries;

public record GetMyOrdersQuery(
    Guid UserId,
    int Page = 1,
    int PageSize = 10
) : IRequest<PagedResult<OrderSummaryDto>>;

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, PagedResult<OrderSummaryDto>>
{
    private readonly IUnitOfWork _uow;
    public GetMyOrdersQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<PagedResult<OrderSummaryDto>> Handle(GetMyOrdersQuery req, CancellationToken ct)
    {
        var (items, total) = await _uow.Orders.GetByUserIdAsync(req.UserId, req.Page, req.PageSize, ct);
        return new PagedResult<OrderSummaryDto>(
            items.Select(OrderMapper.ToSummary), total, req.Page, req.PageSize);
    }
}