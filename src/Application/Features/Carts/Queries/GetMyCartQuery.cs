using Application.Common.Interfaces;
using Application.Features.Carts.DTOs;
using Application.Features.Carts;
using Domain.Interfaces;

namespace Application.Features.Carts.Queries;

public record GetMyCartQuery(Guid UserId);

public class GetMyCartQueryHandler
{
    private readonly IUnitOfWork _uow;

    public GetMyCartQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<CartDto> Handle(GetMyCartQuery query, CancellationToken ct)
    {
        var cart = await _uow.Carts.GetByUserIdAsync(query.UserId);

        // Trả về cart rỗng nếu chưa có
        if (cart is null)
            return new CartDto { UserId = query.UserId };

        return CartMapper.ToDto(cart);
    }
}