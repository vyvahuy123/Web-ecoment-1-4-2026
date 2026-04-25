using Domain.Entities;

namespace Domain.Interfaces;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Payment?> GetByOrderIdAsync(Guid orderId, CancellationToken ct = default);
    Task<(IEnumerable<Payment> Items, int Total)> GetPagedAsync(
        int page, int pageSize, CancellationToken ct = default);
    void Add(Payment payment);
    void Update(Payment payment);
}

public interface IProductImageRepository
{
    Task<ProductImage?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<ProductImage>> GetByProductIdAsync(Guid productId, CancellationToken ct = default);
    Task<ProductImage?> GetMainImageByProductIdAsync(Guid productId, CancellationToken ct = default);
    void Add(ProductImage productImage);
    void Update(ProductImage productImage);
    void Remove(ProductImage productImage);
}

public interface INotificationRepository
{
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IEnumerable<Notification> Items, int Total)> GetByUserIdAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default);
    Task<int> CountUnreadAsync(Guid userId, CancellationToken ct = default);
    void Add(Notification notification);
    void Update(Notification notification);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken ct = default);
}

public interface IWishListRepository
{
    Task<WishList?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<WishList>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid userId, Guid productId, CancellationToken ct = default);
    void Add(WishList wishList);
    void Remove(WishList wishList);
}