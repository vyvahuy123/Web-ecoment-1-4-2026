using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebApi.Hubs;

namespace WebApi.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatRepository _chatRepo;
    private readonly IUserRepository _userRepo;

    public ChatController(IChatRepository chatRepo, IUserRepository userRepo)
    {
        _chatRepo = chatRepo;
        _userRepo = userRepo;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/chat/conversations  (admin xem danh sách)
    [HttpGet("conversations")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetConversations()
    {
        var list = await _chatRepo.GetConversationListAsync(CurrentUserId);

        var result = new List<object>();
        foreach (var (userId, lastMsg, unread) in list)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) continue;

            result.Add(new
            {
                userId = userId,
                username = user.Username,
                fullName = user.FullName,
                isOnline = ChatHub.IsOnline(userId.ToString()),
                unread,
                lastMessage = new
                {
                    content = lastMsg.Content,
                    sentAt = lastMsg.SentAt,
                    fromMe = lastMsg.SenderId == CurrentUserId
                }
            });
        }

        return Ok(result);
    }

    // GET /api/chat/messages/{userId}?page=1
    [HttpGet("messages/{userId:guid}")]
    public async Task<IActionResult> GetMessages(Guid userId, [FromQuery] int page = 1)
    {
        var messages = await _chatRepo.GetConversationAsync(CurrentUserId, userId, page);

        return Ok(messages.Select(m => new
        {
            id = m.Id,
            senderId = m.SenderId,
            receiverId = m.ReceiverId,
            content = m.Content,
            sentAt = m.SentAt,
            isRead = m.IsRead
        }));
    }
}