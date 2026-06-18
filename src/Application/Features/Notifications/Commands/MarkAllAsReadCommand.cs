using Domain.Interfaces;
using MediatR;

namespace Application.Features.Notifications.Commands;

public record MarkAllAsReadCommand(Guid UserId) : IRequest;

public class MarkAllAsReadCommandHandler : IRequestHandler<MarkAllAsReadCommand>
{
    private readonly IUnitOfWork _uow;
    public MarkAllAsReadCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(MarkAllAsReadCommand request, CancellationToken ct)
    {
        await _uow.Notifications.MarkAllAsReadAsync(request.UserId, ct);
        await _uow.SaveChangesAsync(ct);
    }
}