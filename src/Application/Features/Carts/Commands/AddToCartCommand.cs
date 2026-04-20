using Application.Features.Carts.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;
namespace Application.Features.Carts.Commands;
public record AddToCartCommand(Guid UserId, Guid ProductId, int Quantity) : IRequest<CartDto>;
public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, CartDto>
{
    private readonly IUnitOfWork _uow;
    public AddToCartCommandHandler(IUnitOfWork uow) => _uow = uow;
    public async Task<CartDto> Handle(AddToCartCommand cmd, CancellationToken ct)
    {
        var product = await _uow.Products.GetByIdAsync(cmd.ProductId)
            ?? throw new Exception("Product not found");
        if (product.Stock < cmd.Quantity)
            throw new Exception("Not enough stock");
        var cart = await _uow.Carts.GetByUserIdAsync(cmd.UserId);
        if (cart is null)
        {
            cart = Cart.Create(cmd.UserId);
            await _uow.Carts.AddAsync(cart);
        }
        cart.AddOrUpdateItem(cmd.ProductId, product.Price, cmd.Quantity);
        await _uow.SaveChangesAsync(ct);
        return CartMapper.ToDto(cart);
    }
}
