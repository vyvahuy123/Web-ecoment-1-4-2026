using Domain.Entities;

namespace Domain.Interfaces;

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(Guid id);
    Task AddAsync(Review review);
    Task<bool> ExistsByUserAndProductAsync(Guid userId, Guid productId);
    Task<List<Review>> GetApprovedByProductIdAsync(Guid productId, int page, int pageSize);
    Task<List<Review>> GetPendingAsync();
    Task<List<Review>> GetAllAsync(CancellationToken ct = default);
}