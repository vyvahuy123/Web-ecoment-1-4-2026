using Domain.Interfaces;
using MediatR;

namespace Application.Features.WishLists.Commands;

public record RemoveFromWishListCommand(Guid UserId, Guid ProductId) : IRequest;

public class RemoveFromWishListCommandHandler : IRequestHandler<RemoveFromWishListCommand>
{
    private readonly IUnitOfWork _uow;
    public RemoveFromWishListCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(RemoveFromWishListCommand request, CancellationToken ct)
    {
        // Lấy danh sách rồi filter theo ProductId
        var items = await _uow.WishLists.GetByUserIdAsync(request.UserId, ct);
        var item = items.FirstOrDefault(w => w.ProductId == request.ProductId)
            ?? throw new Exception("Wishlist item not found.");

        _uow.WishLists.Remove(item);
        await _uow.SaveChangesAsync(ct);
    }
}