using Domain.Interfaces;
using MediatR;
namespace Application.Features.Carts.Commands;
public record RemoveFromCartCommand(Guid UserId, Guid ProductId) : IRequest;
public class RemoveFromCartCommandHandler : IRequestHandler<RemoveFromCartCommand>
{
    private readonly IUnitOfWork _uow;
    public RemoveFromCartCommandHandler(IUnitOfWork uow) => _uow = uow;
    public async Task Handle(RemoveFromCartCommand cmd, CancellationToken ct)
    {
        var cart = await _uow.Carts.GetByUserIdAsync(cmd.UserId)
            ?? throw new Exception("Cart not found");
        cart.RemoveItem(cmd.ProductId);
        await _uow.SaveChangesAsync(ct);
    }
}
