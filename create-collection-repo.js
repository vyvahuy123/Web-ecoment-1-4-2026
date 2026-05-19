const fs = require('fs');

// 1. Update IUnitOfWork
const uowPath = 'E:/CleanArchitecture/src/Domain/Interfaces/IUnitOfWork.cs';
let uow = fs.readFileSync(uowPath, 'utf8');
uow = uow.replace(
    '    Task<int> SaveChangesAsync(CancellationToken ct = default);',
    '    ICollectionRepository Collections { get; }\n    Task<int> SaveChangesAsync(CancellationToken ct = default);'
);
fs.writeFileSync(uowPath, uow, 'utf8');

// 2. Create CollectionRepository
fs.writeFileSync('E:/CleanArchitecture/src/Infrastructure/Persistence/Repositories/CollectionRepository.cs', `using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class CollectionRepository : ICollectionRepository
{
    private readonly AppDbContext _db;
    public CollectionRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Collection>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Collections.OrderByDescending(c => c.CreatedAt).ToListAsync(ct);

    public async Task<Collection?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.Collections.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<Collection?> GetByIdWithProductsAsync(Guid id, CancellationToken ct = default) =>
        await _db.Collections
            .Include(c => c.Products)
                .ThenInclude(cp => cp.Product)
                    .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IEnumerable<Collection>> GetActiveCollectionsAsync(CancellationToken ct = default) =>
        await _db.Collections
            .Where(c => c.IsActive && DateTime.UtcNow >= c.StartDate && DateTime.UtcNow <= c.EndDate)
            .ToListAsync(ct);

    public async Task<IEnumerable<Collection>> GetCollectionsByProductIdAsync(Guid productId, CancellationToken ct = default) =>
        await _db.Collections
            .Where(c => c.Products.Any(cp => cp.ProductId == productId))
            .ToListAsync(ct);

    public async Task AddAsync(Collection collection, CancellationToken ct = default) =>
        await _db.Collections.AddAsync(collection, ct);

    public void Update(Collection collection) =>
        _db.Collections.Update(collection);

    public void Delete(Collection collection) =>
        _db.Collections.Remove(collection);

    public async Task AddProductAsync(Guid collectionId, Guid productId, CancellationToken ct = default)
    {
        var cp = CollectionProduct.Create(collectionId, productId);
        await _db.CollectionProducts.AddAsync(cp, ct);
    }

    public async Task RemoveProductAsync(Guid collectionId, Guid productId, CancellationToken ct = default)
    {
        var cp = await _db.CollectionProducts
            .FirstOrDefaultAsync(x => x.CollectionId == collectionId && x.ProductId == productId, ct);
        if (cp != null) _db.CollectionProducts.Remove(cp);
    }

    public async Task<bool> ProductExistsInCollectionAsync(Guid collectionId, Guid productId, CancellationToken ct = default) =>
        await _db.CollectionProducts
            .AnyAsync(x => x.CollectionId == collectionId && x.ProductId == productId, ct);
}
`);

console.log('Done');
