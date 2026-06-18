using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("product_variants");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasColumnName("id").ValueGeneratedNever();
        builder.Property(v => v.ProductId).HasColumnName("product_id");
        builder.Property(v => v.Color).HasColumnName("color").HasMaxLength(50).IsRequired();
        builder.Property(v => v.Size).HasColumnName("size").HasMaxLength(20).IsRequired();
        builder.Property(v => v.Price).HasColumnName("price").HasColumnType("decimal(18,2)");
        builder.Property(v => v.Stock).HasColumnName("stock");
        builder.Property(v => v.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
        builder.Property(v => v.CreatedAt).HasColumnName("created_at");
        builder.Property(v => v.UpdatedAt).HasColumnName("updated_at");

        // Unique: 1 product không có 2 variant cùng màu + size
        builder.HasIndex(v => new { v.ProductId, v.Color, v.Size }).IsUnique();

        builder.HasOne(v => v.Product)
            .WithMany(p => p.Variants)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
