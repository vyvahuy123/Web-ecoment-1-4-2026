using Application.Features.WishLists.DTOs;
using Application.Features.WishLists.Mapper;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.WishLists.Commands;

public record AddToWishListCommand(Guid UserId, Guid ProductId) : IRequest<WishListDto>;

public class AddToWishListCommandHandler : IRequestHandler<AddToWishListCommand, WishListDto>
{
    private readonly IUnitOfWork _uow;
    public AddToWishListCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<WishListDto> Handle(AddToWishListCommand request, CancellationToken ct)
    {
        var product = await _uow.Products.GetByIdAsync(request.ProductId)
            ?? throw new Exception("Product not found.");

        var alreadyExists = await _uow.WishLists.ExistsAsync(request.UserId, request.ProductId, ct);
        if (alreadyExists)
            throw new Exception("Product already in wishlist.");

        var wishList = WishList.Create(request.UserId, request.ProductId);

        _uow.WishLists.Add(wishList);
        await _uow.SaveChangesAsync(ct);
        return WishListMapper.ToDto(wishList);
    }
}