using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class NewsRepository : INewsRepository
{
    private readonly AppDbContext _ctx;
    public NewsRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<News?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _ctx.News.FirstOrDefaultAsync(n => n.Id == id, ct);

    public async Task<(IEnumerable<News> Items, int Total)> GetPagedAsync(
        string? category, bool? isPublished, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _ctx.News.AsNoTracking();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(n => n.Category == category);

        if (isPublished.HasValue)
            query = query.Where(n => n.IsPublished == isPublished.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public void Add(News news) => _ctx.News.Add(news);
    public void Update(News news) => _ctx.News.Update(news);
    public void Remove(News news) => _ctx.News.Remove(news);
}