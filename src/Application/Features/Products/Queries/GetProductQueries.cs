using System.Collections.Generic;
using Application.Common;
using Application.Common.Exceptions;
using Application.Features.Products.DTOs;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Products.Queries;

public record GetProductByIdQuery(Guid Id) : IRequest<ProductDto>;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto>
{
    private readonly IUnitOfWork _uow;
    public GetProductByIdQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<ProductDto> Handle(GetProductByIdQuery req, CancellationToken ct)
    {
        var p = await _uow.Products.GetByIdAsync(req.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Product), req.Id);
        var cols = await _uow.Collections.GetCollectionsByProductIdAsync(p.Id, ct);
        return ProductMapper.ToDto(p, cols);
    }
}

public record GetProductsQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    Guid? CategoryId = null
) : IRequest<PagedResult<ProductSummaryDto>>;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedResult<ProductSummaryDto>>
{
    private readonly IUnitOfWork _uow;
    public GetProductsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<PagedResult<ProductSummaryDto>> Handle(GetProductsQuery req, CancellationToken ct)
    {
        var (items, total) = await _uow.Products.GetPagedAsync(
            req.Page, req.PageSize, req.Search, req.CategoryId, ct);

        var summaries = new List<ProductSummaryDto>();
        foreach (var p in items)
        {
            var cols = await _uow.Collections.GetCollectionsByProductIdAsync(p.Id, ct);
            summaries.Add(ProductMapper.ToSummary(p, cols));
        }
        return new PagedResult<ProductSummaryDto>(summaries, total, req.Page, req.PageSize);
    }
}
