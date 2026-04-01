using Domain.Entities;

namespace Application.Common.Interfaces;

/// <summary>
/// Tạo và validate JWT Access Token + Refresh Token.
/// Infrastructure implement, Application chỉ dùng interface.
/// </summary>
public interface IJwtService
{
    /// <summary>Tạo Access Token (short-lived, 15-60 phút)</summary>
    string GenerateAccessToken(User user);

    /// <summary>Tạo Refresh Token (long-lived, 7-30 ngày) - random string, lưu DB</summary>
    string GenerateRefreshToken();

    /// <summary>Lấy UserId từ Access Token đã hết hạn (dùng khi refresh)</summary>
    Guid? GetUserIdFromExpiredToken(string accessToken);
}
