const fs = require('fs');

// Fix 1: ProductDto - thêm SalePrice (file chưa được update)
fs.writeFileSync('E:/CleanArchitecture/src/Application/Features/Products/DTOs/ProductDto.cs', 
`namespace Application.Features.Products.DTOs;
public record ProductDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    decimal? SalePrice,
    int Stock,
    string? ImageUrl,
    bool IsActive,
    Guid CategoryId,
    DateTime CreatedAt
);
public record ProductSummaryDto(
    Guid Id,
    string Name,
    decimal Price,
    decimal? SalePrice,
    int Stock,
    bool IsActive,
    string? ImageUrl,
    Guid? CategoryId,
    int TotalSold = 0
);
`);
console.log('Fix 1 done - ProductDto');

// Fix 2: GetProductQueries - thay Select bằng foreach
fs.writeFileSync('E:/CleanArchitecture/src/Application/Features/Products/Queries/GetProductQueries.cs',
`using System.Collections.Generic;
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
`);
console.log('Fix 2 done - GetProductQueries');

// Fix 3: CreateOrderCommand - fix effectivePrice và tuple
let order = fs.readFileSync('E:/CleanArchitecture/src/Application/Features/Orders/Commands/CreateOrderCommand.cs', 'utf8');

// Fix dòng Add effectivePrice chưa được khai báo
order = order.replace(
    `            subTotal += product.Price * item.Quantity;
            orderItems.Add((product, item.Quantity, effectivePrice));`,
    `            var pCols = await _uow.Collections.GetCollectionsByProductIdAsync(product.Id, ct);
            var pActiveCol = pCols.FirstOrDefault(c => c.IsOnSaleNow());
            decimal effectivePrice = pActiveCol != null
                ? Math.Round(product.Price * (1 - pActiveCol.DiscountPercent / 100), 0)
                : product.Price;
            subTotal += effectivePrice * item.Quantity;
            orderItems.Add((product, item.Quantity, effectivePrice));`
);

// Fix list type nếu chưa đúng
order = order.replace(
    `        var orderItems = new List<(Product product, int quantity)>();`,
    `        var orderItems = new List<(Product product, int quantity, decimal price)>();`
);

fs.writeFileSync('E:/CleanArchitecture/src/Application/Features/Orders/Commands/CreateOrderCommand.cs', order);
console.log('Fix 3 done - CreateOrderCommand');

// Fix 4: Order.cs - đổi tên tham số thành priceOverride
let orderEntity = fs.readFileSync('E:/CleanArchitecture/src/Domain/Entities/Order.cs', 'utf8');
orderEntity = orderEntity.replace(
    `    public static OrderItem Create(Guid orderId, Product product, int quantity, decimal? priceOverride = null, ProductVariant? variant = null)`,
    `    public static OrderItem Create(Guid orderId, Product product, int quantity, decimal? priceOverride = null, ProductVariant? variant = null)`
);
// Đảm bảo dùng priceOverride
if (!orderEntity.includes('priceOverride')) {
    orderEntity = orderEntity.replace(
        `    public static OrderItem Create(Guid orderId, Product product, int quantity, ProductVariant? variant = null)`,
        `    public static OrderItem Create(Guid orderId, Product product, int quantity, decimal? priceOverride = null, ProductVariant? variant = null)`
    );
    orderEntity = orderEntity.replace(
        `            UnitPrice = variant?.Price ?? product.Price,
            Quantity = quantity,
            TotalPrice = (variant?.Price ?? product.Price) * quantity`,
        `            UnitPrice = priceOverride ?? variant?.Price ?? product.Price,
            Quantity = quantity,
            TotalPrice = (priceOverride ?? variant?.Price ?? product.Price) * quantity`
    );
}
fs.writeFileSync('E:/CleanArchitecture/src/Domain/Entities/Order.cs', orderEntity);
console.log('Fix 4 done - Order.cs');

