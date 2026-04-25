using Application.Features.Carts.DTOs;
using Domain.Entities;

namespace Application.Features.Carts;

public static class CartMapper
{
    public static CartDto ToDto(Cart cart) => new()
    {
        CartId = cart.Id,
        UserId = cart.UserId,
        Items = cart.Items.Select(ToItemDto).ToList(),
        TotalItems = cart.Items.Sum(i => i.Quantity),
        GrandTotal = cart.Items.Sum(i => i.TotalPrice)
    };

    public static CartItemDto ToItemDto(CartItem item) => new()
    {
        CartItemId = item.Id,
        ProductId = item.ProductId,
        ProductName = item.Product?.Name ?? string.Empty,
        ProductImageUrl = item.Product?.Images?.FirstOrDefault(x => x.IsMain)?.ImageUrl,
        UnitPrice = item.UnitPrice,
        Quantity = item.Quantity,
        TotalPrice = item.TotalPrice // computed property
    };
}