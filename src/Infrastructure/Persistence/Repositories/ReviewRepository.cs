using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace Infrastructure.Persistence.Repositories;
public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _context;
    public ReviewRepository(AppDbContext context) => _context = context;

    public async Task<Review?> GetByIdAsync(Guid id)
        => await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);

    public async Task AddAsync(Review review)
        => await _context.Reviews.AddAsync(review);

    public async Task<bool> ExistsByUserAndProductAsync(Guid userId, Guid productId)
        => await _context.Reviews.AnyAsync(r => r.UserId == userId && r.ProductId == productId);

    public async Task<List<Review>> GetApprovedByProductIdAsync(Guid productId, int page, int pageSize)
        => await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId && r.Status == Domain.Enums.ReviewStatus.Approved)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

    public async Task<List<Review>> GetAllAsync(CancellationToken ct = default)
        => await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

    public async Task<List<Review>> GetPendingAsync()
        => await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Product)
            .Where(r => r.Status == Domain.Enums.ReviewStatus.Pending)
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();
}