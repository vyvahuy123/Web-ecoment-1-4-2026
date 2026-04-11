using Domain.Entities;

namespace Domain.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IEnumerable<Product> Items, int Total)> GetPagedAsync(
        int page, int pageSize, string? search = null, Guid? categoryId = null, CancellationToken ct = default);
    Task<bool> ExistsByNameAsync(string name, CancellationToken ct = default);
    void Add(Product product);
    void Update(Product product);
    void Remove(Product product);
}

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default);
    Task<IEnumerable<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default);
    void Add(RefreshToken token);
    void Update(RefreshToken token);
    /// <summary>Xóa tất cả refresh token cũ đã hết hạn (cleanup job)</summary>
    Task DeleteExpiredAsync(CancellationToken ct = default);
}

