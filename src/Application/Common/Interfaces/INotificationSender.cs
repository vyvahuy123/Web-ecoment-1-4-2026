namespace Application.Common.Interfaces;

public interface INotificationSender
{
    Task SendAsync(string userId, object payload);
}