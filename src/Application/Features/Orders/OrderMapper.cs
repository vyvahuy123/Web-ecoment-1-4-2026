using Application.Features.Orders.DTOs;
using Domain.Entities;

namespace Application.Features.Orders;

public static class OrderMapper
{
    public static OrderDto ToDto(Order order) => new(
        order.Id,
        order.OrderCode,
        order.UserId,
        order.ShippingFullName,
        order.ShippingPhone,
        order.ShippingProvince,
        order.ShippingDistrict,
        order.ShippingWard,
        order.ShippingStreet,
        order.SubTotal,
        order.ShippingFee,
        order.DiscountAmount,
        order.TotalAmount,
        order.VoucherCode,
        order.Status,
        order.PaymentMethod,
        order.PaymentStatus,
        order.Note,
        order.CancelReason,
        order.PaidAt,
        order.ShippedAt,
        order.DeliveredAt,
        order.CancelledAt,
        order.CreatedAt,
        order.Items.Select(ToItemDto)
    );

    public static OrderItemDto ToItemDto(OrderItem item) => new(
        item.Id,
        item.ProductId,
        item.ProductName,
        item.ProductImageUrl,
        item.UnitPrice,
        item.Quantity,
        item.TotalPrice
    );

    public static OrderSummaryDto ToSummary(Order order) => new(
        order.Id,
        order.OrderCode,
        order.TotalAmount,
        order.Status,
        order.PaymentStatus,
        order.CreatedAt,
        order.Items.Count
    );
}