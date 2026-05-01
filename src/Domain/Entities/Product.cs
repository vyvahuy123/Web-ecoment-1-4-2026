using Domain.Common;
using Domain.Events;
using Domain.ValueObjects;

namespace Domain.Entities;

/// <summary>
/// Product Entity
/// </summary>
public sealed class Product : AuditableEntity
{
    public string Name { get; private set; } = default!;
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public int Stock { get; private set; }
    public string? ImageUrl { get; private set; }
    public bool IsActive { get; private set; }
    public Guid CategoryId { get; private set; }
    public Category Category { get; private set; } = null!;

    private readonly List<ProductImage> _images = new();
    public IReadOnlyCollection<ProductImage> Images => _images.AsReadOnly();

    private Product() { }

    public static Result<Product> Create(
        string name, decimal price, int stock, Guid categoryId, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Product>("Tên sản phẩm không được để trống.");
        if (name.Length > 200)
            return Result.Failure<Product>("Tên sản phẩm tối đa 200 ký tự.");
        if (price < 0)
            return Result.Failure<Product>("Giá không được âm.");
        if (stock < 0)
            return Result.Failure<Product>("Số lượng tồn kho không được âm.");

        var product = new Product
        {
            Name = name.Trim(),
            Description = description?.Trim(),
            Price = price,
            Stock = stock,
            CategoryId = categoryId,
            IsActive = true
        };

        product.AddDomainEvent(new ProductCreatedEvent(product.Id, product.Name));
        return Result.Success(product);
    }

    public Result Update(string name, decimal price, string? description, string? imageUrl, Guid? categoryId)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure("Tên sản phẩm không được để trống.");
        if (price < 0)
            return Result.Failure("Giá không được âm.");
        if (categoryId.HasValue && categoryId.Value == Guid.Empty)
            return Result.Failure("Category không hợp lệ.");

        Name = name.Trim();
        Price = price;
        Description = description?.Trim();
        ImageUrl = imageUrl;

        if (categoryId.HasValue)
            CategoryId = categoryId.Value;

        MarkAsUpdated();
        return Result.Success();
    }

    public Result AdjustStock(int delta)
    {
        if (Stock + delta < 0)
            return Result.Failure($"Không đủ hàng. Tồn kho hiện tại: {Stock}.");
        Stock += delta;
        MarkAsUpdated();
        return Result.Success();
    }

    /// <summary>
    /// Soft-delete: set IsActive = false VÀ IsDeleted = true
    /// để global query filter (p => !p.IsDeleted) lọc sản phẩm ra khỏi mọi query.
    /// </summary>
    public void Delete()
    {
        IsActive = false;
        MarkAsDeleted(); // BaseEntity.MarkAsDeleted() → set IsDeleted = true
        MarkAsUpdated();
    }

    /// <summary>
    /// Chỉ ẩn sản phẩm (không hiển thị ở storefront) nhưng vẫn truy vấn được.
    /// Giữ lại nếu cần dùng riêng; luồng xóa dùng Delete().
    /// </summary>
    public void Deactivate()
    {
        IsActive = false;
        MarkAsUpdated();
    }
}