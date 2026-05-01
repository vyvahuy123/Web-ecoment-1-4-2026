using Domain.Interfaces;
using MediatR;

namespace Application.Features.Notifications.Commands;

public record MarkAsReadCommand(Guid UserId, Guid NotificationId) : IRequest;

public class MarkAsReadCommandHandler : IRequestHandler<MarkAsReadCommand>
{
    private readonly IUnitOfWork _uow;
    public MarkAsReadCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task Handle(MarkAsReadCommand request, CancellationToken ct)
    {
        var notification = await _uow.Notifications.GetByIdAsync(request.NotificationId, ct)
            ?? throw new Exception("Notification not found.");

        if (notification.UserId != request.UserId)
            throw new Exception("Forbidden.");

        notification.MarkAsRead();
        _uow.Notifications.Update(notification);
        await _uow.SaveChangesAsync(ct);
    }
}