using Application.Features.Carts.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;
namespace Application.Features.Carts.Commands;
public record AddToCartCommand(Guid UserId, Guid ProductId, int Quantity, Guid? VariantId = null) : IRequest<CartDto>;
public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, CartDto>
{
    private readonly IUnitOfWork _uow;
    public AddToCartCommandHandler(IUnitOfWork uow) => _uow = uow;
    public async Task<CartDto> Handle(AddToCartCommand cmd, CancellationToken ct)
    {
        var product = await _uow.Products.GetByIdAsync(cmd.ProductId)
            ?? throw new Exception("Product not found");

        decimal unitPrice = product.Price;
        int availableStock = product.Stock;
        string? variantColor = null;
        string? variantSize = null;

        if (cmd.VariantId.HasValue)
        {
            var variant = await _uow.ProductVariants.GetByIdAsync(cmd.VariantId.Value, ct)
                ?? throw new Exception("Variant not found");
            unitPrice = variant.Price;
            availableStock = variant.Stock;
            variantColor = variant.Color;
            variantSize = variant.Size;
        }

        if (availableStock < cmd.Quantity)
            throw new Exception("Not enough stock");

        var cart = await _uow.Carts.GetByUserIdAsync(cmd.UserId);
        if (cart is null)
        {
            cart = Cart.Create(cmd.UserId);
            await _uow.Carts.AddAsync(cart);
        }

        cart.AddOrUpdateItem(cmd.ProductId, unitPrice, cmd.Quantity, cmd.VariantId, variantColor, variantSize);
        await _uow.SaveChangesAsync(ct);
        return CartMapper.ToDto(cart);
    }
}