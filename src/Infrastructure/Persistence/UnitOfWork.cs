using Domain.Interfaces;
using Infrastructure.Persistence.Repositories;

namespace Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _ctx;

    private IUserRepository? _users;
    private IProductRepository? _products;
    private IRefreshTokenRepository? _refreshTokens;
    private IPaymentRepository? _payments;
    private IProductImageRepository? _productImages;
    private INotificationRepository? _notifications;
    private IWishListRepository? _wishLists;

    public UnitOfWork(AppDbContext ctx) => _ctx = ctx;

    public IUserRepository Users
        => _users ??= new UserRepository(_ctx);

    public IProductRepository Products
        => _products ??= new ProductRepository(_ctx);

    public IRefreshTokenRepository RefreshTokens
        => _refreshTokens ??= new RefreshTokenRepository(_ctx);

    public IPaymentRepository Payments
        => _payments ??= new PaymentRepository(_ctx);

    public IProductImageRepository ProductImages
        => _productImages ??= new ProductImageRepository(_ctx);

    public INotificationRepository Notifications
        => _notifications ??= new NotificationRepository(_ctx);

    public IWishListRepository WishLists
        => _wishLists ??= new WishListRepository(_ctx);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _ctx.SaveChangesAsync(ct);
}