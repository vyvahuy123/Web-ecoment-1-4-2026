using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class ProductVariantRepository : IProductVariantRepository
{
    private readonly AppDbContext _ctx;
    public ProductVariantRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<ProductVariant?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Set<ProductVariant>().FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task<IEnumerable<ProductVariant>> GetByProductIdAsync(Guid productId, CancellationToken ct = default)
        => await _ctx.Set<ProductVariant>()
            .Where(v => v.ProductId == productId)
            .OrderBy(v => v.Color).ThenBy(v => v.Size)
            .ToListAsync(ct);

    public async Task<ProductVariant?> GetByProductColorSizeAsync(Guid productId, string color, string size, CancellationToken ct = default)
        => await _ctx.Set<ProductVariant>()
            .FirstOrDefaultAsync(v => v.ProductId == productId && v.Color == color && v.Size == size, ct);

    public void Add(ProductVariant variant) => _ctx.Set<ProductVariant>().Add(variant);
    public void Update(ProductVariant variant) => _ctx.Set<ProductVariant>().Update(variant);
    public void Remove(ProductVariant variant) => _ctx.Set<ProductVariant>().Remove(variant);
}
