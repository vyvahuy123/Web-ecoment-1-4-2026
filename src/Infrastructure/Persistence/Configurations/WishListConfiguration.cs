using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class WishListConfiguration : IEntityTypeConfiguration<WishList>
{
    public void Configure(EntityTypeBuilder<WishList> builder)
    {
        builder.ToTable("wish_lists");
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(w => w.UserId).HasColumnName("user_id");
        builder.Property(w => w.ProductId).HasColumnName("product_id");
        builder.Property(w => w.CreatedAt).HasColumnName("created_at");

        // 1 user không thể thêm cùng 1 sản phẩm 2 lần
        builder.HasIndex(w => new { w.UserId, w.ProductId }).IsUnique();

        builder.HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);  // Xoá user → xoá hết wishlist

        builder.HasOne(w => w.Product)
            .WithMany()
            .HasForeignKey(w => w.ProductId)
            .OnDelete(DeleteBehavior.Cascade);  // Xoá product → xoá khỏi wishlist
    }
}