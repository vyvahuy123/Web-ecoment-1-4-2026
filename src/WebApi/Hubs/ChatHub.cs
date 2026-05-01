using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace WebApi.Hubs;

[Authorize]
public class ChatHub : Hub
{
    // userId → connectionId
    private static readonly ConcurrentDictionary<string, string> _connections = new();

    private readonly IChatRepository _chatRepo;
    private readonly IUnitOfWork _uow;
    private readonly IUserRepository _userRepo;

    public ChatHub(IChatRepository chatRepo, IUnitOfWork uow, IUserRepository userRepo)
    {
        _chatRepo = chatRepo;
        _uow = uow;
        _userRepo = userRepo;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier!;
        _connections[userId] = Context.ConnectionId;

        // Thông báo cho admin biết user online
        await Clients.All.SendAsync("UserOnline", userId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier!;
        _connections.TryRemove(userId, out _);

        await Clients.All.SendAsync("UserOffline", userId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string receiverId, string content)
    {
        var senderIdStr = Context.UserIdentifier!;

        if (!Guid.TryParse(senderIdStr, out var senderId) ||
            !Guid.TryParse(receiverId, out var receiverGuid))
            throw new HubException("UserId không hợp lệ.");

        var message = ChatMessage.Create(senderId, receiverGuid, content);
        await _chatRepo.AddAsync(message);
        await _uow.SaveChangesAsync();

        var payload = new
        {
            id = message.Id,
            senderId = message.SenderId,
            receiverId = message.ReceiverId,
            content = message.Content,
            sentAt = message.SentAt,
            isRead = message.IsRead
        };

        // Gửi cho người nhận nếu đang online
        if (_connections.TryGetValue(receiverId, out var connId))
            await Clients.Client(connId).SendAsync("ReceiveMessage", payload);

        // Gửi lại cho chính sender (confirm)
        await Clients.Caller.SendAsync("ReceiveMessage", payload);
    }

    public async Task MarkAsRead(string senderId)
    {
        var receiverId = Context.UserIdentifier!;
        if (!Guid.TryParse(senderId, out var senderGuid) ||
            !Guid.TryParse(receiverId, out var receiverGuid))
            return;

        await _chatRepo.MarkAllAsReadAsync(senderGuid, receiverGuid);
        await _uow.SaveChangesAsync();

        // Thông báo cho sender biết tin đã được đọc
        if (_connections.TryGetValue(senderId, out var connId))
            await Clients.Client(connId).SendAsync("MessagesRead", receiverId);
    }

    public static bool IsOnline(string userId) => _connections.ContainsKey(userId);
}