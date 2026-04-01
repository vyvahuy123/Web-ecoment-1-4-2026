using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

/// <summary>
/// Thanh toán — mỗi Order có 1 Payment tương ứng
/// </summary>
public class Payment : BaseEntity
{
    public Guid OrderId { get; private set; }
    public PaymentMethod Method { get; private set; }           // COD, VNPay, Momo, BankTransfer, ZaloPay
    public PaymentStatus Status { get; private set; } = PaymentStatus.Unpaid;

    public decimal Amount { get; private set; }                 // Số tiền thanh toán
    public string? TransactionId { get; private set; }          // Mã giao dịch từ cổng TT (VNPay, Momo...)
    public string? GatewayResponse { get; private set; }        // Raw response từ cổng TT (JSON)

    public DateTime? PaidAt { get; private set; }
    public DateTime? RefundedAt { get; private set; }
    public decimal? RefundAmount { get; private set; }
    public string? RefundReason { get; private set; }

    // Navigation
    public Order Order { get; private set; } = null!;

    private Payment() { }

    public static Payment Create(Guid orderId, PaymentMethod method, decimal amount)
        => new Payment
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            Method = method,
            Amount = amount,
            Status = PaymentStatus.Unpaid,
            CreatedAt = DateTime.UtcNow
        };

    public void MarkPaid(string? transactionId = null, string? gatewayResponse = null)
    {
        Status = PaymentStatus.Paid;
        TransactionId = transactionId;
        GatewayResponse = gatewayResponse;
        PaidAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkFailed(string? gatewayResponse = null)
    {
        Status = PaymentStatus.Failed;
        GatewayResponse = gatewayResponse;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Refund(decimal refundAmount, string reason)
    {
        Status = PaymentStatus.Refunded;
        RefundAmount = refundAmount;
        RefundReason = reason;
        RefundedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}