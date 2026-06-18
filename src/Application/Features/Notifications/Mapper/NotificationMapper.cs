using Application.Features.Notifications.DTOs;
using Domain.Entities;

namespace Application.Features.Notifications.Mapper;

public static class NotificationMapper
{
    public static NotificationDto ToDto(Notification n) => new()
    {
        Id = n.Id,
        Title = n.Title,
        Message = n.Message,
        Type = n.Type,
        IsRead = n.IsRead,
        CreatedAt = n.CreatedAt
    };
}