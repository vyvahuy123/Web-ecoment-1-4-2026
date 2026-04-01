using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// Lịch sử sử dụng voucher của từng user
/// </summary>
public class VoucherUsage : BaseEntity
{
    public Guid VoucherId { get; private set; }
    public Guid UserId { get; private set; }
    public Guid OrderId { get; private set; }
    public decimal DiscountAmount { get; private set; }   // Số tiền thực tế được giảm
    public DateTime UsedAt { get; private set; }

    // Navigation
    public Voucher Voucher { get; private set; } = null!;
    public User User { get; private set; } = null!;
    public Order Order { get; private set; } = null!;

    private VoucherUsage() { }

    public static VoucherUsage Create(Guid voucherId, Guid userId, Guid orderId, decimal discountAmount)
        => new VoucherUsage
        {
            Id = Guid.NewGuid(),
            VoucherId = voucherId,
            UserId = userId,
            OrderId = orderId,
            DiscountAmount = discountAmount,
            UsedAt = DateTime.UtcNow
        };
}