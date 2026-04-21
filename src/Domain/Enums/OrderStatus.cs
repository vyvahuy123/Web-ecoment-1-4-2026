using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Enums
{
    public enum OrderStatus
    {
        Pending = 0,
        Confirmed = 1,
        Processing = 2,
        Shipped = 3,
        Delivered = 4,
        Cancelled = 5,
        Refunded = 6,
        PendingCancellation = 7,  
    }
    public enum PaymentMethod
    {
        COD = 0,            // Thanh toán khi nhận hàng
        BankTransfer = 1,   // Chuyển khoản ngân hàng
        VNPay = 2,
        Momo = 3,
        ZaloPay = 4
    }
    public enum PaymentStatus
    {
        Unpaid = 0,
        Paid = 1,
        Refunded = 2,
        Failed = 3
    }
    public enum VoucherType
    {
        Percentage = 0,     // Giảm theo %
        FixedAmount = 1,    // Giảm số tiền cố định
        FreeShipping = 2    // Miễn phí vận chuyển
    }
    public enum ReviewStatus
    {
        Pending = 0,        // Chờ duyệt
        Approved = 1,       // Đã duyệt
        Rejected = 2        // Bị từ chối
    }
    public enum NotificationType
    {
        Order = 1,          // Thông báo liên quan đơn hàng
        Promotion = 2,      // Khuyến mãi, voucher mới
        System = 3,         // Thông báo hệ thống
        Review = 4          // Phản hồi đánh giá
    }
}
