using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

/// <summary>
/// Voucher / Mã giảm giá
/// </summary>
public class Voucher : BaseEntity
{
    public string Code { get; private set; } = string.Empty;           // Mã voucher (VD: SALE50)
    public string? Description { get; private set; }
    public VoucherType Type { get; private set; }                       // % / Cố định / FreeShip
    public decimal DiscountValue { get; private set; }                  // Giá trị giảm
    public decimal? MaxDiscountAmount { get; private set; }             // Giảm tối đa (dùng với %)
    public decimal MinOrderAmount { get; private set; } = 0;           // Đơn tối thiểu để áp dụng
    public int TotalQuantity { get; private set; }                      // Tổng số lượng voucher
    public int UsedQuantity { get; private set; } = 0;                 // Số đã dùng
    public int MaxUsagePerUser { get; private set; } = 1;              // Mỗi user dùng tối đa
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public bool IsActive { get; private set; } = true;
    public string? CreatedBy { get; private set; }

    // Navigation
    private readonly List<VoucherUsage> _usages = new();
    public IReadOnlyCollection<VoucherUsage> Usages => _usages.AsReadOnly();

    private Voucher() { }

    public static Voucher Create(
        string code,
        VoucherType type,
        decimal discountValue,
        int totalQuantity,
        DateTime startDate,
        DateTime endDate,
        decimal minOrderAmount = 0,
        decimal? maxDiscountAmount = null,
        int maxUsagePerUser = 1,
        string? description = null,
        string? createdBy = null)
    {
        return new Voucher
        {
            Id = Guid.NewGuid(),
            Code = code.ToUpper().Trim(),
            Type = type,
            DiscountValue = discountValue,
            MaxDiscountAmount = maxDiscountAmount,
            MinOrderAmount = minOrderAmount,
            TotalQuantity = totalQuantity,
            MaxUsagePerUser = maxUsagePerUser,
            StartDate = startDate,
            EndDate = endDate,
            Description = description,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow
        };
    }

    public bool IsValid(decimal orderAmount, DateTime now)
        => IsActive
        && !IsDeleted
        && now >= StartDate
        && now <= EndDate
        && UsedQuantity < TotalQuantity
        && orderAmount >= MinOrderAmount;

    /// <summary>Tính số tiền được giảm</summary>
    public decimal CalculateDiscount(decimal orderAmount)
    {
        if (Type == VoucherType.FreeShipping) return 0; // xử lý riêng tầng ship
        var discount = Type == VoucherType.Percentage
            ? orderAmount * DiscountValue / 100
            : DiscountValue;
        if (MaxDiscountAmount.HasValue && discount > MaxDiscountAmount.Value)
            discount = MaxDiscountAmount.Value;
        return Math.Min(discount, orderAmount);
    }

    public void IncrementUsage() { UsedQuantity++; UpdatedAt = DateTime.UtcNow; }
    public void Deactivate() { IsActive = false; UpdatedAt = DateTime.UtcNow; }
    public void Delete() { IsDeleted = true; UpdatedAt = DateTime.UtcNow; }

    public void Update(string code, VoucherType type, decimal discountValue,
    int totalQuantity, DateTime startDate, DateTime endDate,
    decimal minOrderAmount, decimal? maxDiscountAmount,
    int maxUsagePerUser, bool isActive, string? description)
    {
        Code = code.ToUpper().Trim();
        Type = type;
        DiscountValue = discountValue;
        TotalQuantity = totalQuantity;
        StartDate = startDate;
        EndDate = endDate;
        MinOrderAmount = minOrderAmount;
        MaxDiscountAmount = maxDiscountAmount;
        MaxUsagePerUser = maxUsagePerUser;
        IsActive = isActive;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }
}