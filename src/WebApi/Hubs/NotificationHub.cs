using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace WebApi.Hubs;

[Authorize]
public class NotificationHub : Hub
{
}
