using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _db;

    public CategoryRepository(AppDbContext db) => _db = db;

    public Task<List<Category>> GetAllAsync(CancellationToken ct = default)
        => _db.Categories.AsNoTracking().ToListAsync(ct);

    public Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => _db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task AddAsync(Category category, CancellationToken ct = default)
        => await _db.Categories.AddAsync(category, ct);

    public void Update(Category category)
        => _db.Categories.Update(category);

    public void Delete(Category category)
        => _db.Categories.Remove(category);
}