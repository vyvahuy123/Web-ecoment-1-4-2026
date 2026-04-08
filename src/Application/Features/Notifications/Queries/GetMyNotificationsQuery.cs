using Application.Features.Notifications.DTOs;
using Application.Features.Notifications.Mapper;
using Domain.Interfaces;
using MediatR;

namespace Application.Features.Notifications.Queries;

public record GetMyNotificationsQuery(Guid UserId, int Page = 1, int PageSize = 20) : IRequest<(List<NotificationDto> Items, int Total, int UnreadCount)>;

public class GetMyNotificationsQueryHandler
{
    private readonly IUnitOfWork _uow;
    public GetMyNotificationsQueryHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<(List<NotificationDto> Items, int Total, int UnreadCount)> Handle(GetMyNotificationsQuery request, CancellationToken ct)
    {
        var (items, total) = await _uow.Notifications.GetByUserIdAsync(request.UserId, request.Page, request.PageSize, ct);
        var unread = await _uow.Notifications.CountUnreadAsync(request.UserId, ct);

        return (items.Select(NotificationMapper.ToDto).ToList(), total, unread);
    }
}