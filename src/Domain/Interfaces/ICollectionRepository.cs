using Domain.Entities;

namespace Domain.Interfaces;

public interface ICollectionRepository
{
    Task<IEnumerable<Collection>> GetAllAsync(CancellationToken ct = default);
    Task<Collection?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Collection?> GetByIdWithProductsAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Collection>> GetActiveCollectionsAsync(CancellationToken ct = default);
    Task<IEnumerable<Collection>> GetCollectionsByProductIdAsync(Guid productId, CancellationToken ct = default);
    Task AddAsync(Collection collection, CancellationToken ct = default);
    void Update(Collection collection);
    void Delete(Collection collection);
    Task AddProductAsync(Guid collectionId, Guid productId, CancellationToken ct = default);
    Task RemoveProductAsync(Guid collectionId, Guid productId, CancellationToken ct = default);
    Task<bool> ProductExistsInCollectionAsync(Guid collectionId, Guid productId, CancellationToken ct = default);
}
