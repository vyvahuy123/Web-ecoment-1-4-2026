using Domain.Enums;

namespace Application.Features.Orders.DTOs;

public record OrderDto(
    Guid Id,
    string OrderCode,
    Guid UserId,
    string ShippingFullName,
    string ShippingPhone,
    string ShippingProvince,
    string ShippingDistrict,
    string ShippingWard,
    string ShippingStreet,
    decimal SubTotal,
    decimal ShippingFee,
    decimal DiscountAmount,
    decimal TotalAmount,
    string? VoucherCode,
    OrderStatus Status,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    string? Note,
    string? CancelReason,
    DateTime? PaidAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime? CancelledAt,
    DateTime CreatedAt,
    IEnumerable<OrderItemDto> Items
);



