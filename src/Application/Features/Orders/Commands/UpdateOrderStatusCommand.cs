using Application.Common.Exceptions;
using Application.Features.Orders.DTOs;
using Domain.Entities;
using Domain.Enums;
using Domain.Interfaces;
using FluentValidation;
using MediatR;
using ValidationException = Application.Common.Exceptions.ValidationException;

namespace Application.Features.Orders.Commands;

public record UpdateOrderStatusCommand(Guid OrderId, OrderStatus NewStatus) : IRequest<OrderDto>;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, OrderDto>
{
    private readonly IUnitOfWork _uow;
    public UpdateOrderStatusCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<OrderDto> Handle(UpdateOrderStatusCommand req, CancellationToken ct)
    {
        var order = await _uow.Orders.GetByIdAsync(req.OrderId, ct)
            ?? throw new NotFoundException(nameof(Order), req.OrderId);

        string notifTitle, notifMessage;

        switch (req.NewStatus)
        {
            case OrderStatus.Confirmed:
                order.Confirm();
                notifTitle = "Đơn hàng đã được xác nhận";
                notifMessage = $"Đơn hàng {order.OrderCode} đã được xác nhận và đang chuẩn bị.";
                break;
            case OrderStatus.Processing:
                order.StartProcessing();
                notifTitle = "Đơn hàng đang được xử lý";
                notifMessage = $"Đơn hàng {order.OrderCode} đang được đóng gói và chuẩn bị giao.";
                break;
            case OrderStatus.Shipped:
                order.Ship();
                notifTitle = "Đơn hàng đang được giao";
                notifMessage = $"Đơn hàng {order.OrderCode} đã được bàn giao cho đơn vị vận chuyển.";
                break;
            case OrderStatus.Delivered:
                order.Deliver();
                notifTitle = "Đơn hàng đã giao thành công";
                notifMessage = $"Đơn hàng {order.OrderCode} đã được giao thành công. Cảm ơn bạn đã mua hàng!";
                break;
            default:
                throw new ValidationException(new[] {
                    new FluentValidation.Results.ValidationFailure("Status", "Trạng thái không hợp lệ.")
                });
        }

        _uow.Orders.Update(order);

        var notification = Notification.Create(
            order.UserId,
            NotificationType.Order,
            notifTitle,
            notifMessage,
            order.Id.ToString());
        _uow.Notifications.Add(notification);

        await _uow.SaveChangesAsync(ct);
        return OrderMapper.ToDto(order);
    }
}