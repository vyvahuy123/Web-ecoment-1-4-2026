using Application.Common.Exceptions;
using Application.Features.Orders.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using MediatR;
using ValidationException = Application.Common.Exceptions.ValidationException;

namespace Application.Features.Orders.Commands;

public record ApproveCancellationCommand(Guid OrderId) : IRequest<OrderDto>;

public class ApproveCancellationCommandHandler : IRequestHandler<ApproveCancellationCommand, OrderDto>
{
    private readonly IUnitOfWork _uow;
    public ApproveCancellationCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<OrderDto> Handle(ApproveCancellationCommand req, CancellationToken ct)
    {
        var order = await _uow.Orders.GetByIdAsync(req.OrderId, ct)
            ?? throw new NotFoundException(nameof(Order), req.OrderId);

        if (order.Status != Domain.Enums.OrderStatus.PendingCancellation)
            throw new ValidationException(new[] {
                new FluentValidation.Results.ValidationFailure("Status",
                    "Đơn hàng không ở trạng thái chờ duyệt huỷ.")
            });

        // Admin duyệt → mới thực sự hủy
        order.Cancel(order.CancellationReason ?? "Admin duyệt huỷ");
        _uow.Orders.Update(order);
        await _uow.SaveChangesAsync(ct);
        return OrderMapper.ToDto(order);
    }
}