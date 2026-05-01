using Domain.Common;

namespace Domain.Entities;

public sealed class Category : BaseEntity
{
    public string Name { get; private set; } = default!;
    public string? Description { get; private set; }

    private Category() { }

    // ── Create ────────────────────────────────────────
    public static Result<Category> Create(string name, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Category>("Tên danh mục không được để trống.");

        return Result.Success(new Category
        {
            Name = name.Trim(),
            Description = description?.Trim()
        });
    }

    // ── Update ───────────────────────────────────────
    public Result Update(string name, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure("Tên danh mục không được để trống.");

        Name = name.Trim();
        Description = description?.Trim();

        return Result.Success();
    }
}