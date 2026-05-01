using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _ctx;
    public OrderRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<Order?> GetByOrderCodeAsync(string orderCode, CancellationToken ct = default)
        => await _ctx.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderCode == orderCode, ct);

    public async Task<(IEnumerable<Order> Items, int Total)> GetByUserIdAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _ctx.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<(IEnumerable<Order> Items, int Total)> GetPagedAsync(
        int page, int pageSize, OrderStatus? status = null, CancellationToken ct = default)
    {
        var query = _ctx.Orders.AsNoTracking().Include(o => o.Items).AsQueryable();

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public void Add(Order order) => _ctx.Orders.Add(order);
    public void Update(Order order) => _ctx.Orders.Update(order);
    public async Task<bool> HasUserPurchasedProductAsync(Guid userId, Guid productId, CancellationToken ct = default)
        => await _ctx.Orders
            .AnyAsync(o => o.UserId == userId
                && o.Status == OrderStatus.Delivered
                && o.Items.Any(i => i.ProductId == productId), ct);
                public async Task<List<Order>> GetAllForDashboardAsync(int year, CancellationToken ct = default)
{
    return await _ctx.Orders
        .AsNoTracking()
        .Include(o => o.Items)
        .Where(o => o.CreatedAt.Year == year)
        .ToListAsync(ct);
}
}