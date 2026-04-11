using Application.Features.Payments.DTOs;
using Application.Features.Payments.Mapper;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Payments.Commands;

public record CreatePaymentCommand(Guid OrderId, PaymentMethod Method) : IRequest<PaymentDto>;

public class CreatePaymentCommandHandler
{
    private readonly IUnitOfWork _uow;
    public CreatePaymentCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<PaymentDto> Handle(CreatePaymentCommand request, CancellationToken ct)
    {
        var order = await _uow.Orders.GetByIdAsync(request.OrderId, ct)
            ?? throw new Exception("Order not found.");

        var existing = await _uow.Payments.GetByOrderIdAsync(request.OrderId, ct);
        if (existing is not null)
            throw new Exception("Payment already exists for this order.");

        var payment = Payment.Create(request.OrderId, request.Method, order.TotalAmount);

        _uow.Payments.Add(payment);
        await _uow.SaveChangesAsync(ct);
        return PaymentMapper.ToDto(payment);
    }
}