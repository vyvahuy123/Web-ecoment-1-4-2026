using Domain.Interfaces;

namespace Application.Features.Carts.Commands;

public record ClearCartCommand(Guid UserId);

public class ClearCartCommandHandler
{
    private readonly IUnitOfWork _uow;
    public ClearCartCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(ClearCartCommand cmd, CancellationToken ct)
    {
        var cart = await _uow.Carts.GetByUserIdAsync(cmd.UserId);
        if (cart is null) return;

        cart.Clear();

        await _uow.SaveChangesAsync(ct);
    }
}