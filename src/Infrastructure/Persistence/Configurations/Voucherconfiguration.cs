using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class VoucherConfiguration : IEntityTypeConfiguration<Voucher>
{
    public void Configure(EntityTypeBuilder<Voucher> builder)
    {
        builder.ToTable("vouchers");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(v => v.Code)
            .HasColumnName("code").HasMaxLength(50).IsRequired();
        builder.HasIndex(v => v.Code).IsUnique();

        builder.Property(v => v.Description)
            .HasColumnName("description").HasMaxLength(500);

        builder.Property(v => v.Type)
            .HasColumnName("type")
            .HasConversion<int>();

        builder.Property(v => v.DiscountValue)
            .HasColumnName("discount_value")
            .HasColumnType("decimal(18,2)");

        builder.Property(v => v.MaxDiscountAmount)
            .HasColumnName("max_discount_amount")
            .HasColumnType("decimal(18,2)");

        builder.Property(v => v.MinOrderAmount)
            .HasColumnName("min_order_amount")
            .HasColumnType("decimal(18,2)")
            .HasDefaultValue(0);

        builder.Property(v => v.TotalQuantity).HasColumnName("total_quantity");
        builder.Property(v => v.UsedQuantity).HasColumnName("used_quantity").HasDefaultValue(0);
        builder.Property(v => v.MaxUsagePerUser).HasColumnName("max_usage_per_user").HasDefaultValue(1);

        builder.Property(v => v.StartDate).HasColumnName("start_date");
        builder.Property(v => v.EndDate).HasColumnName("end_date");
        builder.Property(v => v.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(v => v.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Property(v => v.CreatedAt).HasColumnName("created_at");
        builder.Property(v => v.UpdatedAt).HasColumnName("updated_at");
        builder.Property(v => v.CreatedBy).HasColumnName("created_by").HasMaxLength(100);

        // Truy cập private field _usages
        builder.HasMany(v => v.Usages)
            .WithOne(u => u.Voucher)
            .HasForeignKey(u => u.VoucherId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(v => !v.IsDeleted);
    }
}

public class VoucherUsageConfiguration : IEntityTypeConfiguration<VoucherUsage>
{
    public void Configure(EntityTypeBuilder<VoucherUsage> builder)
    {
        builder.ToTable("voucher_usages");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(v => v.VoucherId).HasColumnName("voucher_id");
        builder.Property(v => v.UserId).HasColumnName("user_id");
        builder.Property(v => v.OrderId).HasColumnName("order_id");
        builder.Property(v => v.DiscountAmount)
            .HasColumnName("discount_amount")
            .HasColumnType("decimal(18,2)");
        builder.Property(v => v.UsedAt).HasColumnName("used_at");

        // 1 user chỉ dùng 1 voucher 1 lần / 1 đơn hàng
        builder.HasIndex(v => new { v.VoucherId, v.UserId, v.OrderId }).IsUnique();

        builder.HasOne(v => v.User)
            .WithMany()
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Order)
            .WithMany(o => o.VoucherUsages)
            .HasForeignKey(v => v.OrderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}