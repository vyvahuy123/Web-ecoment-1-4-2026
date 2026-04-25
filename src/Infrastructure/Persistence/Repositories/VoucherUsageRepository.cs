using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class VoucherUsageRepository : IVoucherUsageRepository
{
    private readonly AppDbContext _ctx;
    public VoucherUsageRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<int> CountByUserAndVoucherAsync(Guid userId, Guid voucherId, CancellationToken ct = default)
        => await _ctx.VoucherUsages
            .CountAsync(v => v.UserId == userId && v.VoucherId == voucherId, ct);

    public void Add(VoucherUsage usage) => _ctx.VoucherUsages.Add(usage);
}