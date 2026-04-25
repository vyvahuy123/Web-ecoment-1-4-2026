using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class VoucherRepository : IVoucherRepository
{
    private readonly AppDbContext _ctx;
    public VoucherRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Voucher?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Vouchers.FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task<Voucher?> GetByCodeAsync(string code, CancellationToken ct = default)
        => await _ctx.Vouchers
            .FirstOrDefaultAsync(v => v.Code == code.ToUpper().Trim(), ct);

    public async Task<(IEnumerable<Voucher> Items, int Total)> GetPagedAsync(
        int page, int pageSize, CancellationToken ct = default)
    {
        var query = _ctx.Vouchers.AsNoTracking();
        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(v => v.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return (items, total);
    }

    public async Task<bool> ExistsByCodeAsync(string code, CancellationToken ct = default)
        => await _ctx.Vouchers.AnyAsync(v => v.Code == code.ToUpper().Trim(), ct);

    public void Add(Voucher voucher) => _ctx.Vouchers.Add(voucher);
    public void Update(Voucher voucher) => _ctx.Vouchers.Update(voucher);
}