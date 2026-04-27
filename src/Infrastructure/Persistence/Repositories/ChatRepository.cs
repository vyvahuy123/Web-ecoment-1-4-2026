using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly AppDbContext _db;

    public ChatRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<ChatMessage>> GetConversationAsync(
        Guid userId1, Guid userId2, int page = 1, int pageSize = 50)
    {
        return await _db.ChatMessages
            .Where(m =>
                (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                (m.SenderId == userId2 && m.ReceiverId == userId1))
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ChatMessage>> GetUnreadMessagesAsync(Guid receiverId)
    {
        return await _db.ChatMessages
            .Where(m => m.ReceiverId == receiverId && !m.IsRead)
            .ToListAsync();
    }

    public async Task<IEnumerable<(Guid UserId, ChatMessage LastMessage, int UnreadCount)>>
        GetConversationListAsync(Guid adminId)
    {
        // Lấy tất cả user đã chat với admin
        var userIds = await _db.ChatMessages
            .Where(m => m.SenderId == adminId || m.ReceiverId == adminId)
            .Select(m => m.SenderId == adminId ? m.ReceiverId : m.SenderId)
            .Distinct()
            .ToListAsync();

        var result = new List<(Guid, ChatMessage, int)>();

        foreach (var uid in userIds)
        {
            var last = await _db.ChatMessages
                .Where(m =>
                    (m.SenderId == adminId && m.ReceiverId == uid) ||
                    (m.SenderId == uid && m.ReceiverId == adminId))
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefaultAsync();

            var unread = await _db.ChatMessages
                .CountAsync(m => m.SenderId == uid && m.ReceiverId == adminId && !m.IsRead);

            if (last != null)
                result.Add((uid, last, unread));
        }

        return result.OrderByDescending(r => r.Item2.SentAt);
    }

    public async Task AddAsync(ChatMessage message)
        => await _db.ChatMessages.AddAsync(message);

    public async Task MarkAllAsReadAsync(Guid senderId, Guid receiverId)
    {
        var msgs = await _db.ChatMessages
            .Where(m => m.SenderId == senderId && m.ReceiverId == receiverId && !m.IsRead)
            .ToListAsync();

        foreach (var m in msgs) m.MarkAsRead();
    }
}
