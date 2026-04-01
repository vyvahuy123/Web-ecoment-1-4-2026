using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("payments");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id").ValueGeneratedNever();

        builder.Property(p => p.OrderId).HasColumnName("order_id");

        builder.Property(p => p.Method)
            .HasColumnName("method")
            .HasConversion<int>();

        builder.Property(p => p.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .HasDefaultValue(Domain.Enums.PaymentStatus.Unpaid);

        builder.Property(p => p.Amount)
            .HasColumnName("amount")
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.TransactionId)
            .HasColumnName("transaction_id")
            .HasMaxLength(200);

        builder.Property(p => p.GatewayResponse)
            .HasColumnName("gateway_response")
            .HasColumnType("nvarchar(max)");

        builder.Property(p => p.PaidAt).HasColumnName("paid_at");
        builder.Property(p => p.RefundedAt).HasColumnName("refunded_at");

        builder.Property(p => p.RefundAmount)
            .HasColumnName("refund_amount")
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.RefundReason)
            .HasColumnName("refund_reason")
            .HasMaxLength(500);

        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");

        // Mỗi Order chỉ có 1 Payment
        builder.HasIndex(p => p.OrderId).IsUnique();
        builder.HasIndex(p => p.Status);

        builder.HasOne(p => p.Order)
            .WithOne()
            .HasForeignKey<Payment>(p => p.OrderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}