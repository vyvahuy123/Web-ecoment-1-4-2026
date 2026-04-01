using Application.Features.Products.DTOs;
using Domain.Entities;

namespace Application.Features.Products;

internal static class ProductMapper
{
    public static ProductDto ToDto(Product p) => new(
        p.Id, p.Name, p.Description, p.Price,
        p.Stock, p.ImageUrl, p.IsActive, p.CategoryId, p.CreatedAt);

    public static ProductSummaryDto ToSummary(Product p) => new(
        p.Id, p.Name, p.Price, p.Stock, p.IsActive, p.ImageUrl);
}
