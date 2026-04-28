using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Features.Orders.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using MediatR;
using ValidationException = Application.Common.Exceptions.ValidationException;

namespace Application.Features.Orders.Commands;

public record CancelOrderCommand(Guid OrderId, Guid UserId, string Reason) : IRequest<OrderDto>;

public class CancelOrderCommandValidator : AbstractValidator<CancelOrderCommand>
{
    public CancelOrderCommandValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand, OrderDto>
{
    private readonly IUnitOfWork _uow;
    private readonly INotificationSender _notifSender;

    public CancelOrderCommandHandler(IUnitOfWork uow, INotificationSender notifSender)
    {
        _uow = uow;
        _notifSender = notifSender;
    }

    public async Task<OrderDto> Handle(CancelOrderCommand req, CancellationToken ct)
    {
        var order = await _uow.Orders.GetByIdAsync(req.OrderId, ct)
            ?? throw new NotFoundException(nameof(Order), req.OrderId);

        if (order.UserId != req.UserId)
            throw new UnauthorizedException("Ban khong co quyen huy don hang nay.");

        if (order.Status != Domain.Enums.OrderStatus.Pending &&
            order.Status != Domain.Enums.OrderStatus.Confirmed)
            throw new ValidationException(new[] {
                new FluentValidation.Results.ValidationFailure("Status",
                    "Chi co the yeu cau huy don hang o trang thai Cho xac nhan hoac Da xac nhan.")
            });

        order.RequestCancellation(req.Reason);
        _uow.Orders.Update(order);
        await _uow.SaveChangesAsync(ct);

        // Push notification cho tất cả admin
        var admins = await _uow.Users.GetAdminsAsync(ct);
        foreach (var admin in admins)
        {
            await _notifSender.SendAsync(admin.Id.ToString(), new
            {
                type = "CANCEL_REQUEST",
                message = $"Don hang {order.OrderCode} yeu cau huy: {req.Reason}",
                orderId = order.Id,
                orderCode = order.OrderCode
            });
        }

        return OrderMapper.ToDto(order);
    }
}
