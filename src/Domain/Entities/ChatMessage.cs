using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Domain.Common;

namespace Domain.Entities;

public sealed class ChatMessage : AuditableEntity
{
    public Guid SenderId { get; private set; }
    public Guid ReceiverId { get; private set; }
    public string Content { get; private set; } = default!;
    public string MessageType { get; private set; } = "text";
    public string? Metadata { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime SentAt { get; private set; }

    private ChatMessage() { }

    public static ChatMessage Create(Guid senderId, Guid receiverId, string content, string messageType = "text", string? metadata = null)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Nội dung không được trống.");

        return new ChatMessage
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content.Trim(),
            IsRead = false,
            MessageType = messageType,
            Metadata = metadata,
            SentAt = DateTime.UtcNow
        };
    }

    public void MarkAsRead()
    {
        IsRead = true;
        MarkAsUpdated();
    }
}
