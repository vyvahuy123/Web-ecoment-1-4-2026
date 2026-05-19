const fs = require('fs');

fs.writeFileSync('E:/CleanArchitecture/src/Application/Features/Collections/Commands/CollectionCommands.cs', `using Application.Common.Exceptions;
using Application.Features.Collections.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation.Results;
using MediatR;

namespace Application.Features.Collections.Commands;

// ── Create ────────────────────────────────────────────────────────────────────
public record CreateCollectionCommand(
    string Name,
    decimal DiscountPercent,
    DateTime StartDate,
    DateTime EndDate,
    string? Description,
    string? ImageUrl
) : IRequest<CollectionDto>;

public class CreateCollectionHandler : IRequestHandler<CreateCollectionCommand, CollectionDto>
{
    private readonly IUnitOfWork _uow;
    public CreateCollectionHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<CollectionDto> Handle(CreateCollectionCommand req, CancellationToken ct)
    {
        var result = Collection.Create(req.Name, req.DiscountPercent, req.StartDate, req.EndDate, req.Description, req.ImageUrl);
        if (result.IsFailure) throw new ValidationException(new[] { new ValidationFailure("", result.Error!) });

        await _uow.Collections.AddAsync(result.Value, ct);
        await _uow.SaveChangesAsync(ct);

        var c = result.Value;
        return new CollectionDto(c.Id, c.Name, c.Description, c.ImageUrl,
            c.DiscountPercent, c.StartDate, c.EndDate, c.IsActive, c.IsOnSaleNow(), c.CreatedAt);
    }
}

// ── Update ────────────────────────────────────────────────────────────────────
public record UpdateCollectionCommand(
    Guid Id,
    string Name,
    decimal DiscountPercent,
    DateTime StartDate,
    DateTime EndDate,
    string? Description,
    string? ImageUrl
) : IRequest<CollectionDto>;

public class UpdateCollectionHandler : IRequestHandler<UpdateCollectionCommand, CollectionDto>
{
    private readonly IUnitOfWork _uow;
    public UpdateCollectionHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<CollectionDto> Handle(UpdateCollectionCommand req, CancellationToken ct)
    {
        var col = await _uow.Collections.GetByIdAsync(req.Id, ct)
            ?? throw new NotFoundException(nameof(Collection), req.Id);

        var result = col.Update(req.Name, req.DiscountPercent, req.StartDate, req.EndDate, req.Description, req.ImageUrl);
        if (result.IsFailure) throw new ValidationException(new[] { new ValidationFailure("", result.Error!) });

        _uow.Collections.Update(col);
        await _uow.SaveChangesAsync(ct);

        return new CollectionDto(col.Id, col.Name, col.Description, col.ImageUrl,
            col.DiscountPercent, col.StartDate, col.EndDate, col.IsActive, col.IsOnSaleNow(), col.CreatedAt);
    }
}

// ── Delete ────────────────────────────────────────────────────────────────────
public record DeleteCollectionCommand(Guid Id) : IRequest;

public class DeleteCollectionHandler : IRequestHandler<DeleteCollectionCommand>
{
    private readonly IUnitOfWork _uow;
    public DeleteCollectionHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(DeleteCollectionCommand req, CancellationToken ct)
    {
        var col = await _uow.Collections.GetByIdAsync(req.Id, ct)
            ?? throw new NotFoundException(nameof(Collection), req.Id);
        _uow.Collections.Delete(col);
        await _uow.SaveChangesAsync(ct);
    }
}

// ── Add Product ───────────────────────────────────────────────────────────────
public record AddProductToCollectionCommand(Guid CollectionId, Guid ProductId) : IRequest;

public class AddProductToCollectionHandler : IRequestHandler<AddProductToCollectionCommand>
{
    private readonly IUnitOfWork _uow;
    public AddProductToCollectionHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(AddProductToCollectionCommand req, CancellationToken ct)
    {
        var col = await _uow.Collections.GetByIdAsync(req.CollectionId, ct)
            ?? throw new NotFoundException(nameof(Collection), req.CollectionId);

        var exists = await _uow.Collections.ProductExistsInCollectionAsync(req.CollectionId, req.ProductId, ct);
        if (exists) throw new ValidationException(new[] { new ValidationFailure("ProductId", "San pham da co trong bo suu tap.") });

        await _uow.Collections.AddProductAsync(req.CollectionId, req.ProductId, ct);
        await _uow.SaveChangesAsync(ct);
    }
}

// ── Remove Product ────────────────────────────────────────────────────────────
public record RemoveProductFromCollectionCommand(Guid CollectionId, Guid ProductId) : IRequest;

public class RemoveProductFromCollectionHandler : IRequestHandler<RemoveProductFromCollectionCommand>
{
    private readonly IUnitOfWork _uow;
    public RemoveProductFromCollectionHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(RemoveProductFromCollectionCommand req, CancellationToken ct)
    {
        await _uow.Collections.RemoveProductAsync(req.CollectionId, req.ProductId, ct);
        await _uow.SaveChangesAsync(ct);
    }
}
`);

fs.writeFileSync('E:/CleanArchitecture/src/Application/Features/Collections/Queries/CollectionQueries.cs', `using Application.Common.Exceptions;
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
`);

console.log('Done');
