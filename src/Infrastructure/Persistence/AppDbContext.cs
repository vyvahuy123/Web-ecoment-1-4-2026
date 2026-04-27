using Domain.Common;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    private readonly IMediator _mediator;

    public AppDbContext(DbContextOptions<AppDbContext> options, IMediator mediator)
        : base(options)
    {
        _mediator = mediator;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<VoucherUsage> VoucherUsages => Set<VoucherUsage>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<WishList> WishLists => Set<WishList>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<News> News => Set<News>();


    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Tự động apply tất cả configuration
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        base.OnModelCreating(builder);

        builder.Entity<ChatMessage>(b => {
            b.HasKey(x => x.Id);
            b.Property(x => x.Content).HasMaxLength(2000).IsRequired();
            b.HasIndex(x => new { x.SenderId, x.ReceiverId, x.SentAt });
        });

        // SOFT DELETE GLOBAL FILTER
        builder.Entity<Product>()
            .HasQueryFilter(p => !p.IsDeleted);

        // Nếu có entity khác cũng soft delete, thêm tiếp ở đây
    }

    // Override SaveChangesAsync để dispatch domain events sau khi save
    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        var result = await base.SaveChangesAsync(ct);
        await DispatchDomainEventsAsync(ct);
        return result;
    }

    private async Task DispatchDomainEventsAsync(CancellationToken ct)
    {
        var entities = ChangeTracker
            .Entries<BaseEntity>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity)
            .ToList();

        var events = entities.SelectMany(e => e.DomainEvents).ToList();
        entities.ForEach(e => e.ClearDomainEvents());

        foreach (var evt in events)
        {
            if (evt is INotification notification)  // ← chỉ publish nếu implement INotification
                await _mediator.Publish(notification, ct);
        }
    }
}