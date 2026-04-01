using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// Ảnh sản phẩm — 1 Product có nhiều ảnh, 1 ảnh là ảnh chính (IsMain)
/// </summary>
public class ProductImage : BaseEntity
{
    public Guid ProductId { get; private set; }
    public string ImageUrl { get; private set; } = string.Empty;
    public bool IsMain { get; private set; } = false;           // Ảnh đại diện chính
    public int SortOrder { get; private set; } = 0;             // Thứ tự hiển thị

    // Navigation
    public Product Product { get; private set; } = null!;

    private ProductImage() { }

    public static ProductImage Create(Guid productId, string imageUrl, bool isMain = false, int sortOrder = 0)
        => new ProductImage
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            ImageUrl = imageUrl,
            IsMain = isMain,
            SortOrder = sortOrder,
            CreatedAt = DateTime.UtcNow
        };

    public void SetAsMain() => IsMain = true;
    public void UnsetMain() => IsMain = false;
    public void UpdateSortOrder(int order) => SortOrder = order;
}