using Domain.Common;
namespace Domain.Entities;

/// <summary>
/// Biến thể sản phẩm — mỗi combination màu + size có stock và giá riêng
/// </summary>
public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; private set; }
    public string Color { get; private set; } = default!;
    public string Size { get; private set; } = default!;
    public decimal Price { get; private set; }
    public int Stock { get; private set; }
    public string? ImageUrl { get; private set; }

    // Navigation
    public Product Product { get; private set; } = null!;

    private ProductVariant() { }

    public static Result<ProductVariant> Create(Guid productId, string color, string size, decimal price, int stock, string? imageUrl = null)
    {
        if (string.IsNullOrWhiteSpace(color))
            return Result.Failure<ProductVariant>("Màu không được để trống.");
        if (string.IsNullOrWhiteSpace(size))
            return Result.Failure<ProductVariant>("Size không được để trống.");
        if (price < 0)
            return Result.Failure<ProductVariant>("Giá không được âm.");
        if (stock < 0)
            return Result.Failure<ProductVariant>("Số lượng không được âm.");

        return Result.Success(new ProductVariant
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Color = color.Trim(),
            Size = size.Trim(),
            Price = price,
            Stock = stock,
            ImageUrl = imageUrl,
            CreatedAt = DateTime.UtcNow
        });
    }

    public Result Update(string color, string size, decimal price, int stock, string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(color)) return Result.Failure("Màu không được để trống.");
        if (string.IsNullOrWhiteSpace(size)) return Result.Failure("Size không được để trống.");
        if (price < 0) return Result.Failure("Giá không được âm.");
        if (stock < 0) return Result.Failure("Số lượng không được âm.");
        Color = color.Trim();
        Size = size.Trim();
        Price = price;
        Stock = stock;
        ImageUrl = imageUrl;
        MarkAsUpdated();
        return Result.Success();
    }

    public Result AdjustStock(int delta)
    {
        if (Stock + delta < 0)
            return Result.Failure($"Không đủ hàng. Tồn kho variant: {Stock}.");
        Stock += delta;
        MarkAsUpdated();
        return Result.Success();
    }
}
