using Domain.Entities;

namespace Domain.Interfaces;

public interface INewsRepository
{
    Task<News?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<(IEnumerable<News> Items, int Total)> GetPagedAsync(
        string? category, bool? isPublished, int page, int pageSize, CancellationToken ct = default);
    void Add(News news);
    void Update(News news);
    void Remove(News news);
}