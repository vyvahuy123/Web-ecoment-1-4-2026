using Domain.Entities;

namespace Domain.Interfaces;

/// <summary>Mở rộng IUnitOfWork để thêm tất cả repositories</summary>
public interface IUnitOfWork
{
    IUserRepository Users { get; }
    IProductRepository Products { get; }
    IRefreshTokenRepository RefreshTokens { get; }

    // Repositories mới - Day 1
    IPaymentRepository Payments { get; }
    IProductImageRepository ProductImages { get; }
    INotificationRepository Notifications { get; }
    IWishListRepository WishLists { get; }

    // Repositories mới - Day 2
    IOrderRepository Orders { get; }
    IAddressRepository Addresses { get; }
    IVoucherRepository Vouchers { get; }
    IVoucherUsageRepository VoucherUsages { get; }
    // Repositories mới - Day 3
    ICartRepository Carts { get; }
    IReviewRepository Reviews { get; }
    ICategoryRepository Categories { get; }
    INewsRepository News { get; }
    IBannerRepository Banners { get; }


    Task<int> SaveChangesAsync(CancellationToken ct = default);
}