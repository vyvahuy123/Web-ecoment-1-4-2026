using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(r => r.Token)
            .HasColumnName("token").HasMaxLength(256).IsRequired();
        builder.HasIndex(r => r.Token).IsUnique();

        builder.Property(r => r.UserId).HasColumnName("user_id");
        builder.Property(r => r.ExpiresAt).HasColumnName("expires_at");
        builder.Property(r => r.IsRevoked).HasColumnName("is_revoked").HasDefaultValue(false);
        builder.Property(r => r.ReplacedByToken).HasColumnName("replaced_by_token").HasMaxLength(256);
        builder.Property(r => r.CreatedByIp).HasColumnName("created_by_ip").HasMaxLength(45);
        builder.Property(r => r.RevokedByIp).HasColumnName("revoked_by_ip").HasMaxLength(45);
        builder.Property(r => r.CreatedAt).HasColumnName("created_at");
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);
        builder.HasQueryFilter(r => !r.User.IsDeleted);
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(p => p.Name)
            .HasColumnName("name").HasMaxLength(200).IsRequired();

        builder.Property(p => p.Description)
            .HasColumnName("description").HasMaxLength(2000);

        builder.Property(p => p.Price)
            .HasColumnName("price")
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.Stock).HasColumnName("stock");
        builder.Property(p => p.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
        builder.Property(p => p.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(p => p.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Property(p => p.CategoryId).HasColumnName("category_id");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
        builder.Property(p => p.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
        builder.Property(p => p.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);

        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.Name);

        // Soft-delete global query filter
        builder.HasQueryFilter(p => !p.IsDeleted);
        builder.Navigation(p => p.Images).HasField("_images");
    }
}
