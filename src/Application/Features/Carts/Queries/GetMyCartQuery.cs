using Application.Features.Carts.DTOs;
using Domain.Interfaces;
using MediatR;
namespace Application.Features.Carts.Queries;
public record GetMyCartQuery(Guid UserId) : IRequest<CartDto>;
public class GetMyCartQueryHandler : IRequestHandler<GetMyCartQuery, CartDto>
{
    private readonly IUnitOfWork _uow;
    public GetMyCartQueryHandler(IUnitOfWork uow) => _uow = uow;
    public async Task<CartDto> Handle(GetMyCartQuery query, CancellationToken ct)
    {
        var cart = await _uow.Carts.GetByUserIdAsync(query.UserId);
        if (cart is null)
            return new CartDto { UserId = query.UserId };
        return CartMapper.ToDto(cart);
    }
}
