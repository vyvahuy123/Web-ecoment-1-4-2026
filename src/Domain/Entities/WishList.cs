using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// Danh sách yêu thích — User lưu sản phẩm muốn mua sau
/// </summary>
public class WishList : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid ProductId { get; private set; }

    // Navigation
    public User User { get; private set; } = null!;
    public Product Product { get; private set; } = null!;

    private WishList() { }

    public static WishList Create(Guid userId, Guid productId)
        => new WishList
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = productId,
            CreatedAt = DateTime.UtcNow
        };
}