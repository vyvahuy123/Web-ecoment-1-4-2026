using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// Item trong giỏ hàng
/// </summary>
public class CartItem : BaseEntity
{
    public Guid CartId { get; private set; }
    public Guid ProductId { get; private set; }
    public decimal UnitPrice { get; private set; }      // Giá tại thời điểm thêm vào giỏ
    public int Quantity { get; private set; }
    public decimal TotalPrice => UnitPrice * Quantity;

    // Navigation
    public Cart Cart { get; private set; } = null!;
    public Product Product { get; private set; } = null!;

    private CartItem() { }

    public static CartItem Create(Guid cartId, Guid productId, decimal unitPrice, int quantity)
        => new CartItem
        {
            Id = Guid.NewGuid(),
            CartId = cartId,
            ProductId = productId,
            UnitPrice = unitPrice,
            Quantity = quantity,
            CreatedAt = DateTime.UtcNow
        };

    public void UpdateQuantity(int quantity)
    {
        Quantity = quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePrice(decimal newPrice)
    {
        UnitPrice = newPrice;
        UpdatedAt = DateTime.UtcNow;
    }
}