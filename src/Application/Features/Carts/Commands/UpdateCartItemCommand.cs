using Domain.Interfaces;
using MediatR;
namespace Application.Features.Carts.Commands;
public record UpdateCartItemCommand(Guid UserId, Guid ProductId, int Quantity) : IRequest;
public class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand>
{
    private readonly IUnitOfWork _uow;
    public UpdateCartItemCommandHandler(IUnitOfWork uow) => _uow = uow;
    public async Task Handle(UpdateCartItemCommand cmd, CancellationToken ct)
    {
        var cart = await _uow.Carts.GetByUserIdAsync(cmd.UserId)
            ?? throw new Exception("Cart not found");
        cart.SetItemQuantity(cmd.ProductId, cmd.Quantity);
        await _uow.SaveChangesAsync(ct);
    }
}
