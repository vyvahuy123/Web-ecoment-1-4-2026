using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class BannerRepository : IBannerRepository
{
    private readonly AppDbContext _ctx;
    public BannerRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<Banner>> GetAllActiveAsync(CancellationToken ct = default)
        => await _ctx.Banners
            .Where(b => b.IsActive && !b.IsDeleted)
            .OrderBy(b => b.SortOrder)
            .ToListAsync(ct);

    public async Task<IEnumerable<Banner>> GetAllAsync(CancellationToken ct = default)
        => await _ctx.Banners
            .Where(b => !b.IsDeleted)
            .OrderBy(b => b.SortOrder)
            .ToListAsync(ct);

    public async Task<Banner?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Banners.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted, ct);

    public void Add(Banner banner) => _ctx.Banners.Add(banner);
    public void Update(Banner banner) => _ctx.Banners.Update(banner);
    public void Remove(Banner banner) => _ctx.Banners.Remove(banner);
}