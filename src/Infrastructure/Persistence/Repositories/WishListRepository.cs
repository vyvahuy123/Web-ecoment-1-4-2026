using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class WishListRepository : IWishListRepository
{
    private readonly AppDbContext _ctx;
    public WishListRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<WishList?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.WishLists.FirstOrDefaultAsync(w => w.Id == id, ct);

    public async Task<IEnumerable<WishList>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        => await _ctx.WishLists
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .Include(w => w.Product)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(ct);

    public async Task<bool> ExistsAsync(Guid userId, Guid productId, CancellationToken ct = default)
        => await _ctx.WishLists
            .AnyAsync(w => w.UserId == userId && w.ProductId == productId, ct);

    public void Add(WishList wishList) => _ctx.WishLists.Add(wishList);
    public void Remove(WishList wishList) => _ctx.WishLists.Remove(wishList);
}