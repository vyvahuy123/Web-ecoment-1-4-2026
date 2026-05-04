// Infrastructure/Persistence/UnitOfWork.cs
using Domain.Interfaces;
using Infrastructure.Persistence.Repositories;
using Infrastructure.Repositories;

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
    private IOrderRepository? _orders;
    private IAddressRepository? _addresses;
    private IVoucherRepository? _vouchers;
    private IVoucherUsageRepository? _voucherUsages;
    private ICartRepository? _carts;
    private IReviewRepository? _reviews;
    private ICategoryRepository? _categories;
    private INewsRepository? _news; 


    public UnitOfWork(AppDbContext ctx) => _ctx = ctx;

    public IUserRepository Users => _users ??= new UserRepository(_ctx);
    public IProductRepository Products => _products ??= new ProductRepository(_ctx);
    public IRefreshTokenRepository RefreshTokens => _refreshTokens ??= new RefreshTokenRepository(_ctx);
    public IPaymentRepository Payments => _payments ??= new PaymentRepository(_ctx);
    public IProductImageRepository ProductImages => _productImages ??= new ProductImageRepository(_ctx);
    public INotificationRepository Notifications => _notifications ??= new NotificationRepository(_ctx);
    public IWishListRepository WishLists => _wishLists ??= new WishListRepository(_ctx);
    public IOrderRepository Orders => _orders ??= new OrderRepository(_ctx);
    public IAddressRepository Addresses => _addresses ??= new AddressRepository(_ctx);
    public IVoucherRepository Vouchers => _vouchers ??= new VoucherRepository(_ctx);
    public IVoucherUsageRepository VoucherUsages => _voucherUsages ??= new VoucherUsageRepository(_ctx);
    public ICartRepository Carts => _carts ??= new CartRepository(_ctx);
    public IReviewRepository Reviews => _reviews ??= new ReviewRepository(_ctx);
    public ICategoryRepository Categories => _categories ??= new CategoryRepository(_ctx);
    public INewsRepository News => _news ??= new NewsRepository(_ctx);
    public IBannerRepository Banners => new BannerRepository(_ctx);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _ctx.SaveChangesAsync(ct);
}