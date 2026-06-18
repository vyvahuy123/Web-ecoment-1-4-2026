using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class ProductImageRepository : IProductImageRepository
{
    private readonly AppDbContext _ctx;
    public ProductImageRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<ProductImage?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.ProductImages.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IEnumerable<ProductImage>> GetByProductIdAsync(Guid productId, CancellationToken ct = default)
        => await _ctx.ProductImages
            .AsNoTracking()
            .Where(p => p.ProductId == productId)
            .OrderBy(p => p.SortOrder)
            .ToListAsync(ct);

    public async Task<ProductImage?> GetMainImageByProductIdAsync(Guid productId, CancellationToken ct = default)
        => await _ctx.ProductImages
            .FirstOrDefaultAsync(p => p.ProductId == productId && p.IsMain, ct);

    public void Add(ProductImage productImage) => _ctx.ProductImages.Add(productImage);
    public void Update(ProductImage productImage) => _ctx.ProductImages.Update(productImage);
    public void Remove(ProductImage productImage) => _ctx.ProductImages.Remove(productImage);
}