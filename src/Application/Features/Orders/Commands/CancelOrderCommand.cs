using Application.Common.Exceptions;
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
    public CancelOrderCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<OrderDto> Handle(CancelOrderCommand req, CancellationToken ct)
    {
        var order = await _uow.Orders.GetByIdAsync(req.OrderId, ct)
            ?? throw new NotFoundException(nameof(Order), req.OrderId);

        if (order.UserId != req.UserId)
            throw new UnauthorizedException("Bạn không có quyền huỷ đơn hàng này.");

        if (order.Status != Domain.Enums.OrderStatus.Pending &&
            order.Status != Domain.Enums.OrderStatus.Confirmed)
            throw new ValidationException(new[] {
                new FluentValidation.Results.ValidationFailure("Status", "Không thể huỷ đơn hàng ở trạng thái này.")
            });

        order.Cancel(req.Reason);
        _uow.Orders.Update(order);
        await _uow.SaveChangesAsync(ct);
        return OrderMapper.ToDto(order);
    }
}