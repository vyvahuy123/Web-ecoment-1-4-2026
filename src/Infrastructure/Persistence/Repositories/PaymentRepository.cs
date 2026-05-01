using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _ctx;
    public PaymentRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Payment?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Payments.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Payment?> GetByOrderIdAsync(Guid orderId, CancellationToken ct = default)
        => await _ctx.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId, ct);

    public async Task<(IEnumerable<Payment> Items, int Total)> GetPagedAsync(
    int page, int pageSize, CancellationToken ct = default)
{
    var query = _ctx.Payments.AsNoTracking().Include(p => p.Order);
    var total = await query.CountAsync(ct);
    var items = await query
        .OrderByDescending(p => p.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync(ct);
    return (items, total);
}

    public void Add(Payment payment) => _ctx.Payments.Add(payment);
    public void Update(Payment payment) => _ctx.Payments.Update(payment);
}