using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(o => o.OrderCode)
            .HasColumnName("order_code").HasMaxLength(30).IsRequired();
        builder.HasIndex(o => o.OrderCode).IsUnique();

        builder.Property(o => o.UserId).HasColumnName("user_id");

        // Snapshot địa chỉ giao hàng
        builder.Property(o => o.ShippingFullName).HasColumnName("shipping_full_name").HasMaxLength(100).IsRequired();
        builder.Property(o => o.ShippingPhone).HasColumnName("shipping_phone").HasMaxLength(15).IsRequired();
        builder.Property(o => o.ShippingProvince).HasColumnName("shipping_province").HasMaxLength(100).IsRequired();
        builder.Property(o => o.ShippingDistrict).HasColumnName("shipping_district").HasMaxLength(100).IsRequired();
        builder.Property(o => o.ShippingWard).HasColumnName("shipping_ward").HasMaxLength(100).IsRequired();
        builder.Property(o => o.ShippingStreet).HasColumnName("shipping_street").HasMaxLength(255).IsRequired();

        // Tiền tệ
        builder.Property(o => o.SubTotal).HasColumnName("sub_total").HasColumnType("decimal(18,2)");
        builder.Property(o => o.ShippingFee).HasColumnName("shipping_fee").HasColumnType("decimal(18,2)");
        builder.Property(o => o.DiscountAmount).HasColumnName("discount_amount").HasColumnType("decimal(18,2)");
        builder.Property(o => o.TotalAmount).HasColumnName("total_amount").HasColumnType("decimal(18,2)");

        // Voucher snapshot
        builder.Property(o => o.VoucherId).HasColumnName("voucher_id");
        builder.Property(o => o.VoucherCode).HasColumnName("voucher_code").HasMaxLength(50);

        // Enum → int
        builder.Property(o => o.Status).HasColumnName("status").HasConversion<int>();
        builder.Property(o => o.PaymentMethod).HasColumnName("payment_method").HasConversion<int>();
        builder.Property(o => o.PaymentStatus).HasColumnName("payment_status").HasConversion<int>();

        builder.Property(o => o.Note).HasColumnName("note").HasMaxLength(500);
        builder.Property(o => o.CancelReason).HasColumnName("cancel_reason").HasMaxLength(500);
        builder.Property(o => o.PaidAt).HasColumnName("paid_at");
        builder.Property(o => o.ShippedAt).HasColumnName("shipped_at");
        builder.Property(o => o.DeliveredAt).HasColumnName("delivered_at");
        builder.Property(o => o.CancelledAt).HasColumnName("cancelled_at");
        builder.Property(o => o.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Property(o => o.CreatedAt).HasColumnName("created_at");
        builder.Property(o => o.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.CreatedAt);

        builder.HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // FK tới Voucher (nullable — đơn không dùng voucher vẫn OK)
        builder.HasOne(o => o.Voucher)
            .WithMany()
            .HasForeignKey(o => o.VoucherId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Navigation _items dùng backing field
        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(o => !o.IsDeleted);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("order_items");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(i => i.OrderId).HasColumnName("order_id");
        builder.Property(i => i.ProductId).HasColumnName("product_id");
        builder.Property(i => i.ProductName).HasColumnName("product_name").HasMaxLength(200).IsRequired();
        builder.Property(i => i.ProductImageUrl).HasColumnName("product_image_url").HasMaxLength(500);
        builder.Property(i => i.UnitPrice).HasColumnName("unit_price").HasColumnType("decimal(18,2)");
        builder.Property(i => i.Quantity).HasColumnName("quantity");
        builder.Property(i => i.TotalPrice).HasColumnName("total_price").HasColumnType("decimal(18,2)");

        // Không dùng HasQueryFilter vì OrderItem không có soft delete riêng
        // → được lọc theo Order (cascade)

        builder.HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);   // Không xoá product khi còn order
    }
}