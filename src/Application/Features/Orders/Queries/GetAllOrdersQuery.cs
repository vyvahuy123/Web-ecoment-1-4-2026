using Application.Common;
using Application.Features.Orders.DTOs;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Orders.Queries;

public record GetAllOrdersQuery(
    int Page = 1,
    int PageSize = 20,
    Domain.Enums.OrderStatus? Status = null
) : IRequest<PagedResult<OrderSummaryDto>>;

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, PagedResult<OrderSummaryDto>>
{
    private readonly IUnitOfWork _uow;
    public GetAllOrdersQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<PagedResult<OrderSummaryDto>> Handle(GetAllOrdersQuery req, CancellationToken ct)
    {
        var (items, total) = await _uow.Orders.GetPagedAsync(req.Page, req.PageSize, req.Status, ct);
        return new PagedResult<OrderSummaryDto>(
            items.Select(OrderMapper.ToSummary), total, req.Page, req.PageSize);
    }
}