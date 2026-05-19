const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/ProductMapper.cs';

fs.writeFileSync(path, `using Application.Features.Products.DTOs;
using Domain.Entities;
namespace Application.Features.Products;
internal static class ProductMapper
{
    public static decimal? GetSalePrice(Product p, IEnumerable<Collection>? collections)
    {
        if (collections == null) return null;
        var active = collections.FirstOrDefault(c => c.IsOnSaleNow());
        if (active == null) return null;
        return Math.Round(p.Price * (1 - active.DiscountPercent / 100), 0);
    }

    public static ProductDto ToDto(Product p, IEnumerable<Collection>? collections = null) => new(
        p.Id, p.Name, p.Description, p.Price,
        GetSalePrice(p, collections),
        p.Stock, p.ImageUrl, p.IsActive, p.CategoryId, p.CreatedAt);

    public static ProductSummaryDto ToSummary(Product p, IEnumerable<Collection>? collections = null) => new(
        p.Id, p.Name, p.Price,
        GetSalePrice(p, collections),
        p.Stock, p.IsActive, p.ImageUrl, p.CategoryId);
}
`);
console.log('Done');
