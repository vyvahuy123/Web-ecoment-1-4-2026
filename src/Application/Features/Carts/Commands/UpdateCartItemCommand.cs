using Domain.Interfaces;

namespace Application.Features.Carts.Commands;

public record UpdateCartItemCommand(Guid UserId, Guid ProductId, int Quantity);

public class UpdateCartItemCommandHandler
{
    private readonly IUnitOfWork _uow;
    public UpdateCartItemCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(UpdateCartItemCommand cmd, CancellationToken ct)
    {
        var cart = await _uow.Carts.GetByUserIdAsync(cmd.UserId)
            ?? throw new Exception("Cart not found");

        cart.SetItemQuantity(cmd.ProductId, cmd.Quantity); // quantity=0 tự xoá

        await _uow.SaveChangesAsync(ct);
    }
}