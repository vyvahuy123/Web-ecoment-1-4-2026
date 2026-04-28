using Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;
using WebApi.Hubs;

namespace WebApi.Services;

public class SignalRNotificationSender : INotificationSender
{
    private readonly IHubContext<NotificationHub> _hub;
    public SignalRNotificationSender(IHubContext<NotificationHub> hub) => _hub = hub;

    public async Task SendAsync(string userId, object payload)
    {
        await _hub.Clients.User(userId).SendAsync("ReceiveNotification", payload);
    }
}
