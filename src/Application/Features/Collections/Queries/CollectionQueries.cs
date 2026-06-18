using Application.Common.Exceptions;
using Application.Features.Collections.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Collections.Queries;

// ── Get All ───────────────────────────────────────────────────────────────────
public record GetCollectionsQuery : IRequest<IEnumerable<CollectionDto>>;

public class GetCollectionsHandler : IRequestHandler<GetCollectionsQuery, IEnumerable<CollectionDto>>
{
    private readonly IUnitOfWork _uow;
    public GetCollectionsHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<CollectionDto>> Handle(GetCollectionsQuery req, CancellationToken ct)
    {
        var cols = await _uow.Collections.GetAllAsync(ct);
        return cols.Select(c => new CollectionDto(
            c.Id, c.Name, c.Description, c.ImageUrl,
            c.DiscountPercent, c.StartDate, c.EndDate,
            c.IsActive, c.IsOnSaleNow(), c.CreatedAt));
    }
}

// ── Get By Id ─────────────────────────────────────────────────────────────────
public record GetCollectionByIdQuery(Guid Id) : IRequest<CollectionDetailDto>;

public class GetCollectionByIdHandler : IRequestHandler<GetCollectionByIdQuery, CollectionDetailDto>
{
    private readonly IUnitOfWork _uow;
    public GetCollectionByIdHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<CollectionDetailDto> Handle(GetCollectionByIdQuery req, CancellationToken ct)
    {
        var col = await _uow.Collections.GetByIdWithProductsAsync(req.Id, ct)
            ?? throw new NotFoundException(nameof(Collection), req.Id);

        var products = col.Products.Select(cp => new CollectionProductDto(
            cp.ProductId,
            cp.Product.Name,
            cp.Product.Price,
            Math.Round(cp.Product.Price * (1 - col.DiscountPercent / 100), 0),
            cp.Product.Images.FirstOrDefault()?.ImageUrl ?? cp.Product.ImageUrl,
            cp.Product.IsActive
        ));

        return new CollectionDetailDto(
            col.Id, col.Name, col.Description, col.ImageUrl,
            col.DiscountPercent, col.StartDate, col.EndDate,
            col.IsActive, col.IsOnSaleNow(), col.CreatedAt, products);
    }
}

// ── Get Active Collections ────────────────────────────────────────────────────
public record GetActiveCollectionsQuery : IRequest<IEnumerable<CollectionDto>>;

public class GetActiveCollectionsHandler : IRequestHandler<GetActiveCollectionsQuery, IEnumerable<CollectionDto>>
{
    private readonly IUnitOfWork _uow;
    public GetActiveCollectionsHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<IEnumerable<CollectionDto>> Handle(GetActiveCollectionsQuery req, CancellationToken ct)
    {
        var cols = await _uow.Collections.GetActiveCollectionsAsync(ct);
        return cols.Select(c => new CollectionDto(
            c.Id, c.Name, c.Description, c.ImageUrl,
            c.DiscountPercent, c.StartDate, c.EndDate,
            c.IsActive, c.IsOnSaleNow(), c.CreatedAt));
    }
}
