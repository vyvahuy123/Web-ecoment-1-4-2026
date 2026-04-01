using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.ToTable("addresses");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(a => a.UserId).HasColumnName("user_id");
        builder.Property(a => a.FullName).HasColumnName("full_name").HasMaxLength(100).IsRequired();
        builder.Property(a => a.Phone).HasColumnName("phone").HasMaxLength(15).IsRequired();
        builder.Property(a => a.Province).HasColumnName("province").HasMaxLength(100).IsRequired();
        builder.Property(a => a.District).HasColumnName("district").HasMaxLength(100).IsRequired();
        builder.Property(a => a.Ward).HasColumnName("ward").HasMaxLength(100).IsRequired();
        builder.Property(a => a.Street).HasColumnName("street").HasMaxLength(255).IsRequired();
        builder.Property(a => a.IsDefault).HasColumnName("is_default").HasDefaultValue(false);
        builder.Property(a => a.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Property(a => a.CreatedAt).HasColumnName("created_at");
        builder.Property(a => a.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(a => a.UserId);

        builder.HasOne(a => a.User)
            .WithMany()                         // User có nhiều Address
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(a => !a.IsDeleted);
    }
}