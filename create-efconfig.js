const fs = require('fs');

fs.writeFileSync('E:/CleanArchitecture/src/Infrastructure/Persistence/Configurations/CollectionConfiguration.cs', `using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class CollectionConfiguration : IEntityTypeConfiguration<Collection>
{
    public void Configure(EntityTypeBuilder<Collection> builder)
    {
        builder.ToTable("collections");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id").ValueGeneratedNever();
        builder.Property(c => c.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        builder.Property(c => c.Description).HasColumnName("description");
        builder.Property(c => c.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
        builder.Property(c => c.DiscountPercent).HasColumnName("discount_percent").HasColumnType("decimal(5,2)");
        builder.Property(c => c.StartDate).HasColumnName("start_date");
        builder.Property(c => c.EndDate).HasColumnName("end_date");
        builder.Property(c => c.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(c => c.CreatedAt).HasColumnName("created_at");
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at");
        builder.Property(c => c.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
        builder.Property(c => c.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
        builder.Property(c => c.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}

public class CollectionProductConfiguration : IEntityTypeConfiguration<CollectionProduct>
{
    public void Configure(EntityTypeBuilder<CollectionProduct> builder)
    {
        builder.ToTable("collection_products");
        builder.HasKey(cp => new { cp.CollectionId, cp.ProductId });
        builder.Property(cp => cp.CollectionId).HasColumnName("collection_id");
        builder.Property(cp => cp.ProductId).HasColumnName("product_id");

        builder.HasOne(cp => cp.Collection)
            .WithMany(c => c.Products)
            .HasForeignKey(cp => cp.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cp => cp.Product)
            .WithMany()
            .HasForeignKey(cp => cp.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
`);

console.log('Done');
