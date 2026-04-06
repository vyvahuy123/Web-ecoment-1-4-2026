using Application.Common.Exceptions;
using Application.Features.Orders.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using MediatR;
using ValidationException = Application.Common.Exceptions.ValidationException;

namespace Application.Features.Orders.Commands;

public record UpdateOrderStatusCommand(Guid OrderId, Domain.Enums.OrderStatus NewStatus) : IRequest<OrderDto>;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, OrderDto>
{
    private readonly IUnitOfWork _uow;
    public UpdateOrderStatusCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<OrderDto> Handle(UpdateOrderStatusCommand req, CancellationToken ct)
    {
        var order = await _uow.Orders.GetByIdAsync(req.OrderId, ct)
            ?? throw new NotFoundException(nameof(Order), req.OrderId);

        switch (req.NewStatus)
        {
            case Domain.Enums.OrderStatus.Confirmed: order.Confirm(); break;
            case Domain.Enums.OrderStatus.Processing: order.StartProcessing(); break;
            case Domain.Enums.OrderStatus.Shipped: order.Ship(); break;
            case Domain.Enums.OrderStatus.Delivered: order.Deliver(); break;
            default:
                throw new ValidationException(new[] {
                    new FluentValidation.Results.ValidationFailure("Status", "Trạng thái không hợp lệ.")
                });
        }

        _uow.Orders.Update(order);
        await _uow.SaveChangesAsync(ct);
        return OrderMapper.ToDto(order);
    }
}