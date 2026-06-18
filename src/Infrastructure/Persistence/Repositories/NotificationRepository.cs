using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _ctx;
    public NotificationRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<Notification?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _ctx.Notifications.FirstOrDefaultAsync(n => n.Id == id, ct);

    public async Task<(IEnumerable<Notification> Items, int Total)> GetByUserIdAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _ctx.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<int> CountUnreadAsync(Guid userId, CancellationToken ct = default)
        => await _ctx.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, ct);

    public void Add(Notification notification) => _ctx.Notifications.Add(notification);
    public void Update(Notification notification) => _ctx.Notifications.Update(notification);

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default)
    {
        var unread = await _ctx.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var n in unread)
            n.MarkAsRead();
    }
}