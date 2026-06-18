using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("product_images");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(p => p.ProductId).HasColumnName("product_id");

        builder.Property(p => p.ImageUrl)
            .HasColumnName("image_url")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(p => p.IsMain)
            .HasColumnName("is_main")
            .HasDefaultValue(false);

        builder.Property(p => p.SortOrder)
            .HasColumnName("sort_order")
            .HasDefaultValue(0);

        builder.Property(p => p.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(p => p.ProductId);

        builder.HasOne(p => p.Product)
            .WithMany(p => p.Images)  // ← sửa từ WithMany("_images")
            .HasForeignKey(p => p.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}