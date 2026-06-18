using Application.Features.Products.DTOs;
using Domain.Entities;
namespace Application.Features.Products;
internal static class ProductMapper
{
    private static decimal? GetSalePrice(Product p, IEnumerable<Collection>? collections)
    {
        // Giá sale trực tiếp trên sản phẩm
        decimal? directSale = p.SalePrice;

        // Giá sale từ collection đang active
        decimal? collectionSale = null;
        var active = collections?.FirstOrDefault(c => c.IsOnSaleNow());
        if (active != null)
            collectionSale = Math.Round(p.Price * (1 - active.DiscountPercent / 100), 0);

        // Lấy giá thấp nhất
        if (directSale.HasValue && collectionSale.HasValue)
            return Math.Min(directSale.Value, collectionSale.Value);
        return directSale ?? collectionSale;
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
