using Application.Features.WishLists.DTOs;
using Domain.Entities;

namespace Application.Features.WishLists.Mapper;

public static class WishListMapper
{
    public static WishListDto ToDto(WishList w) => new()
    {
        Id = w.Id,
        ProductId = w.ProductId,
        ProductName = w.Product?.Name ?? string.Empty,
        ProductPrice = w.Product?.Price ?? 0,
        ProductImageUrl = w.Product?.Images?.FirstOrDefault(i => i.IsMain)?.ImageUrl,
        AddedAt = w.CreatedAt
    };
}