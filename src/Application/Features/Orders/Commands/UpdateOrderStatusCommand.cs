using Application.Common.Exceptions;
using Application.Common.Interfaces;
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
    private readonly INotificationSender _notifSender;

    public UpdateOrderStatusCommandHandler(IUnitOfWork uow, INotificationSender notifSender)
    {
        _uow = uow;
        _notifSender = notifSender;
    }

    public async Task<OrderDto> Handle(UpdateOrderStatusCommand req, CancellationToken ct)
    {
        var order = await _uow.Orders.GetByIdAsync(req.OrderId, ct)
            ?? throw new NotFoundException(nameof(Order), req.OrderId);

        string notifTitle, notifMessage;
        switch (req.NewStatus)
        {
            case OrderStatus.Confirmed:
                order.Confirm();
                notifTitle = "Don hang da duoc xac nhan";
                notifMessage = $"Don hang {order.OrderCode} da duoc xac nhan va dang chuan bi.";
                break;
            case OrderStatus.Processing:
                order.StartProcessing();
                notifTitle = "Don hang dang duoc xu ly";
                notifMessage = $"Don hang {order.OrderCode} dang duoc dong goi va chuan bi giao.";
                break;
            case OrderStatus.Shipped:
                order.Ship();
                notifTitle = "Don hang dang duoc giao";
                notifMessage = $"Don hang {order.OrderCode} da duoc ban giao cho don vi van chuyen.";
                break;
            case OrderStatus.Delivered:
                order.Deliver();
                notifTitle = "Don hang da giao thanh cong";
                notifMessage = $"Don hang {order.OrderCode} da duoc giao thanh cong. Cam on ban da mua hang!";
                break;
            default:
                throw new ValidationException(new[] {
                    new FluentValidation.Results.ValidationFailure("Status", "Trang thai khong hop le.")
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

        await _notifSender.SendAsync(order.UserId.ToString(), new
        {
            type = "ORDER_STATUS_UPDATED",
            title = notifTitle,
            message = notifMessage,
            orderId = order.Id,
            orderCode = order.OrderCode,
            newStatus = req.NewStatus.ToString()
        });

        return OrderMapper.ToDto(order);
    }
}
