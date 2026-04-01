using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

/// <summary>
/// Đơn hàng
/// </summary>
public class Order : BaseEntity
{
    public string OrderCode { get; private set; } = string.Empty;      // Mã đơn: ORD-20250319-0001
    public Guid UserId { get; private set; }

    // Snapshot địa chỉ lúc đặt hàng (không dùng FK vì user có thể xoá address)
    public string ShippingFullName { get; private set; } = string.Empty;
    public string ShippingPhone { get; private set; } = string.Empty;
    public string ShippingProvince { get; private set; } = string.Empty;
    public string ShippingDistrict { get; private set; } = string.Empty;
    public string ShippingWard { get; private set; } = string.Empty;
    public string ShippingStreet { get; private set; } = string.Empty;

    // Giá tiền
    public decimal SubTotal { get; private set; }           // Tổng tiền hàng (trước giảm)
    public decimal ShippingFee { get; private set; }        // Phí vận chuyển
    public decimal DiscountAmount { get; private set; }     // Tổng tiền được giảm
    public decimal TotalAmount { get; private set; }        // Tổng thanh toán cuối cùng

    // Voucher
    public Guid? VoucherId { get; private set; }
    public string? VoucherCode { get; private set; }        // Snapshot mã voucher

    // Trạng thái
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; private set; }
    public PaymentStatus PaymentStatus { get; private set; } = PaymentStatus.Unpaid;

    public string? Note { get; private set; }               // Ghi chú của khách
    public string? CancelReason { get; private set; }       // Lý do huỷ
    public DateTime? PaidAt { get; private set; }
    public DateTime? ShippedAt { get; private set; }
    public DateTime? DeliveredAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }

    // Navigation
    public User User { get; private set; } = null!;
    public Voucher? Voucher { get; private set; }

    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    private readonly List<VoucherUsage> _voucherUsages = new();
    public IReadOnlyCollection<VoucherUsage> VoucherUsages => _voucherUsages.AsReadOnly();

    private Order() { }

    public static Order Create(
        string orderCode,
        Guid userId,
        Address shippingAddress,
        decimal subTotal,
        decimal shippingFee,
        decimal discountAmount,
        PaymentMethod paymentMethod,
        Guid? voucherId = null,
        string? voucherCode = null,
        string? note = null)
    {
        var total = subTotal + shippingFee - discountAmount;
        return new Order
        {
            Id = Guid.NewGuid(),
            OrderCode = orderCode,
            UserId = userId,
            ShippingFullName = shippingAddress.FullName,
            ShippingPhone = shippingAddress.Phone,
            ShippingProvince = shippingAddress.Province,
            ShippingDistrict = shippingAddress.District,
            ShippingWard = shippingAddress.Ward,
            ShippingStreet = shippingAddress.Street,
            SubTotal = subTotal,
            ShippingFee = shippingFee,
            DiscountAmount = discountAmount,
            TotalAmount = total < 0 ? 0 : total,
            VoucherId = voucherId,
            VoucherCode = voucherCode,
            PaymentMethod = paymentMethod,
            Note = note,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void AddItem(OrderItem item) => _items.Add(item);

    public void Confirm() { Status = OrderStatus.Confirmed; UpdatedAt = DateTime.UtcNow; }
    public void StartProcessing() { Status = OrderStatus.Processing; UpdatedAt = DateTime.UtcNow; }
    public void Ship() { Status = OrderStatus.Shipped; ShippedAt = DateTime.UtcNow; UpdatedAt = DateTime.UtcNow; }
    public void Deliver() { Status = OrderStatus.Delivered; DeliveredAt = DateTime.UtcNow; UpdatedAt = DateTime.UtcNow; }
    public void MarkPaid() { PaymentStatus = PaymentStatus.Paid; PaidAt = DateTime.UtcNow; UpdatedAt = DateTime.UtcNow; }

    public void Cancel(string reason)
    {
        Status = OrderStatus.Cancelled;
        CancelReason = reason;
        CancelledAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Delete() { IsDeleted = true; UpdatedAt = DateTime.UtcNow; }
}

/// <summary>
/// Chi tiết sản phẩm trong đơn hàng (snapshot giá tại thời điểm đặt)
/// </summary>
public class OrderItem : BaseEntity
{
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }

    // Snapshot thông tin sản phẩm lúc đặt hàng
    public string ProductName { get; private set; } = string.Empty;
    public string? ProductImageUrl { get; private set; }
    public decimal UnitPrice { get; private set; }          // Giá tại thời điểm đặt
    public int Quantity { get; private set; }
    public decimal TotalPrice { get; private set; }         // UnitPrice * Quantity

    // Navigation
    public Order Order { get; private set; } = null!;
    public Product Product { get; private set; } = null!;

    private OrderItem() { }

    public static OrderItem Create(Guid orderId, Product product, int quantity)
        => new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            ProductId = product.Id,
            ProductName = product.Name,
            ProductImageUrl = product.ImageUrl,
            UnitPrice = product.Price,
            Quantity = quantity,
            TotalPrice = product.Price * quantity
        };
}