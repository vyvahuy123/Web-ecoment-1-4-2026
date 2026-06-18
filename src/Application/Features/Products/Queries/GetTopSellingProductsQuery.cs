using Application.Common;
using Application.Features.Products.DTOs;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Products.Queries;

public record GetTopSellingProductsQuery(int Limit = 8) : IRequest<List<ProductSummaryDto>>;

public class GetTopSellingProductsQueryHandler
    : IRequestHandler<GetTopSellingProductsQuery, List<ProductSummaryDto>>
{
    private readonly IUnitOfWork _uow;
    public GetTopSellingProductsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<List<ProductSummaryDto>> Handle(
        GetTopSellingProductsQuery req, CancellationToken ct)
    {
        var topSelling = await _uow.Products.GetTopSellingAsync(req.Limit, ct);

        return topSelling
            .Select(x => ProductMapper.ToSummary(x.Product) with { TotalSold = x.TotalSold })
            .ToList();
    }
}