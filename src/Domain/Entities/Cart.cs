using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// Giỏ hàng — mỗi User có 1 Cart duy nhất (tạo khi lần đầu thêm sản phẩm)
/// </summary>
public class Cart : BaseEntity
{
    public Guid UserId { get; private set; }

    // Navigation
    public User User { get; private set; } = null!;

    private readonly List<CartItem> _items = new();
    public IReadOnlyCollection<CartItem> Items => _items.AsReadOnly();

    private Cart() { }

    public static Cart Create(Guid userId)
        => new Cart
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

    /// <summary>Thêm hoặc tăng số lượng sản phẩm</summary>
    public void AddOrUpdateItem(Guid productId, decimal unitPrice, int quantity)
    {
        var existing = _items.FirstOrDefault(i => i.ProductId == productId);
        if (existing != null)
            existing.UpdateQuantity(existing.Quantity + quantity);
        else
            _items.Add(CartItem.Create(Id, productId, unitPrice, quantity));
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Cập nhật số lượng item (quantity = 0 → xoá)</summary>
    public void SetItemQuantity(Guid productId, int quantity)
    {
        var item = _items.FirstOrDefault(i => i.ProductId == productId);
        if (item == null) return;
        if (quantity <= 0)
            _items.Remove(item);
        else
            item.UpdateQuantity(quantity);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid productId)
    {
        var item = _items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null) { _items.Remove(item); UpdatedAt = DateTime.UtcNow; }
    }

    public void Clear() { _items.Clear(); UpdatedAt = DateTime.UtcNow; }
    public decimal GetTotal() => _items.Sum(i => i.TotalPrice);
}