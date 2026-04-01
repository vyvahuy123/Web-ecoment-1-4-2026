using Domain.Common;

namespace Domain.Entities;

/// <summary>
/// Refresh Token entity - lưu token để cấp lại Access Token mới khi hết hạn.
/// Mỗi User có thể có nhiều Refresh Token (multi-device).
/// </summary>
public sealed class RefreshToken : BaseEntity
{
    public string Token { get; private set; } = default!;
    public Guid UserId { get; private set; }
    public User User { get; private set; } = default!;
    public DateTime ExpiresAt { get; private set; }
    public bool IsRevoked { get; private set; }
    public string? ReplacedByToken { get; private set; }
    public string? CreatedByIp { get; private set; }
    public string? RevokedByIp { get; private set; }

    // EF Core
    private RefreshToken() { }

    public static RefreshToken Create(Guid userId, string token, DateTime expiresAt, string? ip = null)
        => new()
        {
            UserId      = userId,
            Token       = token,
            ExpiresAt   = expiresAt,
            CreatedByIp = ip,
            IsRevoked   = false
        };

    public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAt;

    public void Revoke(string? ip = null, string? replacedBy = null)
    {
        IsRevoked        = true;
        RevokedByIp      = ip;
        ReplacedByToken  = replacedBy;
        MarkAsUpdated();
    }
}
