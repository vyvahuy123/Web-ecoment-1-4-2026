using Application.Features.Payments.DTOs;
using Domain.Entities;

namespace Application.Features.Payments.Mapper;

public static class PaymentMapper
{
    public static PaymentDto ToDto(Payment p) => new()
    {
        Id = p.Id,
        OrderId = p.OrderId,
        Method = p.Method,
        Status = p.Status,
        Amount = p.Amount,
        TransactionId = p.TransactionId,
        PaidAt = p.PaidAt,
        OrderCode = p.Order?.OrderCode
    };
}