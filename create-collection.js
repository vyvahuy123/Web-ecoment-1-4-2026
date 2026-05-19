const fs = require('fs');

fs.writeFileSync('E:/CleanArchitecture/src/Domain/Entities/Collection.cs', `using Domain.Common;

namespace Domain.Entities;

public sealed class Collection : AuditableEntity
{
    public string Name { get; private set; } = default!;
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public bool IsActive { get; private set; }

    private readonly List<CollectionProduct> _products = new();
    public IReadOnlyCollection<CollectionProduct> Products => _products.AsReadOnly();

    private Collection() { }

    public static Result<Collection> Create(
        string name, decimal discountPercent,
        DateTime startDate, DateTime endDate,
        string? description = null, string? imageUrl = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Collection>("Ten bo suu tap khong duoc de trong.");
        if (discountPercent <= 0 || discountPercent > 100)
            return Result.Failure<Collection>("Phan tram giam gia phai tu 1-100.");
        if (endDate <= startDate)
            return Result.Failure<Collection>("Ngay ket thuc phai sau ngay bat dau.");

        return Result.Success(new Collection
        {
            Name = name.Trim(),
            Description = description?.Trim(),
            ImageUrl = imageUrl,
            DiscountPercent = discountPercent,
            StartDate = startDate,
            EndDate = endDate,
            IsActive = true
        });
    }

    public Result Update(string name, decimal discountPercent,
        DateTime startDate, DateTime endDate,
        string? description, string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure("Ten khong duoc de trong.");
        if (discountPercent <= 0 || discountPercent > 100)
            return Result.Failure("Phan tram giam gia phai tu 1-100.");
        if (endDate <= startDate)
            return Result.Failure("Ngay ket thuc phai sau ngay bat dau.");

        Name = name.Trim();
        Description = description?.Trim();
        ImageUrl = imageUrl;
        DiscountPercent = discountPercent;
        StartDate = startDate;
        EndDate = endDate;
        MarkAsUpdated();
        return Result.Success();
    }

    public bool IsOnSaleNow() =>
        IsActive && DateTime.UtcNow >= StartDate && DateTime.UtcNow <= EndDate;

    public void Activate() { IsActive = true; MarkAsUpdated(); }
    public void Deactivate() { IsActive = false; MarkAsUpdated(); }
}
`);

fs.writeFileSync('E:/CleanArchitecture/src/Domain/Entities/CollectionProduct.cs', `namespace Domain.Entities;

public sealed class CollectionProduct
{
    public Guid CollectionId { get; private set; }
    public Guid ProductId { get; private set; }

    public Collection Collection { get; private set; } = null!;
    public Product Product { get; private set; } = null!;

    private CollectionProduct() { }

    public static CollectionProduct Create(Guid collectionId, Guid productId) =>
        new() { CollectionId = collectionId, ProductId = productId };
}
`);

console.log('Done');
