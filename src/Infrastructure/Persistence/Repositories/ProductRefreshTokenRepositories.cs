using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _ctx;
    public ProductRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Set<Product>().FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<(IEnumerable<Product> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? search = null, Guid? categoryId = null, CancellationToken ct = default)
    {
        var query = _ctx.Set<Product>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s) ||
                (p.Description != null && p.Description.ToLower().Contains(s)));
        }

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<bool> ExistsByNameAsync(string name, CancellationToken ct = default)
        => await _ctx.Set<Product>().AnyAsync(p => p.Name == name, ct);

    public void Add(Product product) => _ctx.Set<Product>().Add(product);
    public void Update(Product product) => _ctx.Set<Product>().Update(product);
    public void Remove(Product product) => _ctx.Set<Product>().Remove(product);

    public async Task<IEnumerable<(Product Product, int TotalSold)>> GetTopSellingAsync(
        int limit = 8, CancellationToken ct = default)
    {
        var topIds = await _ctx.Set<OrderItem>()
            .AsNoTracking()
            .Where(oi => oi.Order.Status == OrderStatus.Delivered)
            .GroupBy(oi => oi.ProductId)
            .Select(g => new { ProductId = g.Key, TotalSold = g.Sum(oi => oi.Quantity) })
            .OrderByDescending(x => x.TotalSold)
            .Take(limit)
            .ToListAsync(ct);

        if (!topIds.Any())
        {
            var fallback = await _ctx.Set<Product>()
                .AsNoTracking()
                .Where(p => p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .Take(limit)
                .ToListAsync(ct);

            return fallback.Select(p => (p, 0));
        }

        var productIds = topIds.Select(x => x.ProductId).ToList();
        var products = await _ctx.Set<Product>()
            .AsNoTracking()
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync(ct);

        return topIds.Join(products, x => x.ProductId, p => p.Id, (x, p) => (p, x.TotalSold));
    }
}

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _ctx;
    public RefreshTokenRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default)
        => await _ctx.Set<RefreshToken>()
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == token, ct);

    public async Task<IEnumerable<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _ctx.Set<RefreshToken>()
            .Where(r => r.UserId == userId && !r.IsRevoked && r.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(ct);

    public void Add(RefreshToken token) => _ctx.Set<RefreshToken>().Add(token);
    public void Update(RefreshToken token) => _ctx.Set<RefreshToken>().Update(token);

    public async Task DeleteExpiredAsync(CancellationToken ct = default)
    {
        var expired = await _ctx.Set<RefreshToken>()
            .Where(r => r.ExpiresAt < DateTime.UtcNow || r.IsRevoked)
            .ToListAsync(ct);
        _ctx.Set<RefreshToken>().RemoveRange(expired);
    }
}