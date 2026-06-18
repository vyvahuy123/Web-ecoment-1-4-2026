using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("reviews");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(r => r.ProductId).HasColumnName("product_id");
        builder.Property(r => r.UserId).HasColumnName("user_id");
        builder.Property(r => r.OrderId).HasColumnName("order_id").IsRequired(false);

        builder.Property(r => r.Rating)
            .HasColumnName("rating")
            .IsRequired();

        builder.Property(r => r.Comment)
            .HasColumnName("comment")
            .HasMaxLength(2000);

        // JSON array ảnh — lưu dạng string
        builder.Property(r => r.ImageUrls)
            .HasColumnName("image_urls")
            .HasColumnType("nvarchar(max)");

        builder.Property(r => r.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .HasDefaultValue(Domain.Enums.ReviewStatus.Pending);

        builder.Property(r => r.AdminReply).HasColumnName("admin_reply").HasMaxLength(1000);
        builder.Property(r => r.RepliedAt).HasColumnName("replied_at");
        builder.Property(r => r.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Property(r => r.CreatedAt).HasColumnName("created_at");
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at");

        // 1 user chỉ review 1 sản phẩm 1 lần / 1 đơn hàng
        builder.HasIndex(r => new { r.ProductId, r.UserId, r.OrderId }).IsUnique();
        builder.HasIndex(r => r.ProductId);
        builder.HasIndex(r => r.Status);

        builder.HasOne(r => r.Product)
            .WithMany()
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Order)
            .WithMany()
            .HasForeignKey(r => r.OrderId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}