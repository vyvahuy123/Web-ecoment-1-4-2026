using Application.Common.Interfaces;
using Application.Features.WishLists.DTOs;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.WishLists.Queries;

public record GetMyWishListQuery(Guid UserId) : IRequest<List<WishListDto>>;

public class GetMyWishListQueryHandler : IRequestHandler<GetMyWishListQuery, List<WishListDto>>
{
    private readonly IUnitOfWork _uow;
    public GetMyWishListQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<List<WishListDto>> Handle(GetMyWishListQuery request, CancellationToken ct)
    {
        var items = await _uow.WishLists.GetByUserIdAsync(request.UserId);
        return items.Select(w => new WishListDto
        {
            Id = w.Id,
            ProductId = w.ProductId,
            ProductName = w.Product?.Name ?? string.Empty,
            ProductPrice = w.Product?.Price ?? 0,
            ProductImageUrl = w.Product?.Images?.FirstOrDefault(x => x.IsMain)?.ImageUrl,
            AddedAt = w.CreatedAt
        }).ToList();
    }
}