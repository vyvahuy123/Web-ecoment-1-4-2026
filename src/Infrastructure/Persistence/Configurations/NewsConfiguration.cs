using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class NewsConfiguration : IEntityTypeConfiguration<News>
{
    public void Configure(EntityTypeBuilder<News> builder)
    {
        builder.ToTable("news");

        builder.HasKey(n => n.Id);
        builder.Property(n => n.Id).HasColumnName("id").ValueGeneratedOnAdd();

        builder.Property(n => n.Title)
            .HasColumnName("title")
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(n => n.Description)
            .HasColumnName("description")
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(n => n.Content)
            .HasColumnName("content")
            .HasColumnType("nvarchar(max)")
            .IsRequired();

        builder.Property(n => n.ImageUrl)
            .HasColumnName("image_url")
            .HasMaxLength(500);

        builder.Property(n => n.Category)
            .HasColumnName("category")
            .HasMaxLength(100);

        builder.Property(n => n.IsPublished)
            .HasColumnName("is_published")
            .HasDefaultValue(false);

        builder.Property(n => n.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(n => n.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired(false);
    }
}
