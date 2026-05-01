using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces;

public interface IChatRepository
{
    Task<IEnumerable<ChatMessage>> GetConversationAsync(
        Guid userId1, Guid userId2, int page = 1, int pageSize = 50);

    Task<IEnumerable<ChatMessage>> GetUnreadMessagesAsync(Guid receiverId);

    Task<IEnumerable<(Guid UserId, ChatMessage LastMessage, int UnreadCount)>>
        GetConversationListAsync(Guid adminId);

    Task AddAsync(ChatMessage message);
    Task MarkAllAsReadAsync(Guid senderId, Guid receiverId);
}
