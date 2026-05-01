using Application.Common.Exceptions;
using Application.Features.Orders.DTOs;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Orders.Queries;

public record GetOrderByIdQuery(Guid OrderId, Guid UserId, bool IsAdmin = false) : IRequest<OrderDto>;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto>
{
    private readonly IUnitOfWork _uow;
    public GetOrderByIdQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<OrderDto> Handle(GetOrderByIdQuery req, CancellationToken ct)
    {
        var order = await _uow.Orders.GetByIdAsync(req.OrderId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Order), req.OrderId);

        if (!req.IsAdmin && order.UserId != req.UserId)
            throw new UnauthorizedException("Ban khong co quyen xem don hang nay.");

        return OrderMapper.ToDto(order);
    }
}