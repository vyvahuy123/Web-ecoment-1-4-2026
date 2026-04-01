using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

/// <summary>
/// Thông báo gửi đến User (đơn hàng, khuyến mãi, hệ thống...)
/// </summary>
public class Notification : BaseEntity
{
    public Guid UserId { get; private set; }
    public NotificationType Type { get; private set; }          // Order, Promotion, System, Review
    public string Title { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public string? ReferenceId { get; private set; }            // OrderId, ProductId... tuỳ Type
    public bool IsRead { get; private set; } = false;
    public DateTime? ReadAt { get; private set; }

    // Navigation
    public User User { get; private set; } = null!;

    private Notification() { }

    public static Notification Create(
        Guid userId,
        NotificationType type,
        string title,
        string message,
        string? referenceId = null)
        => new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        };

    public void MarkAsRead()
    {
        IsRead = true;
        ReadAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}