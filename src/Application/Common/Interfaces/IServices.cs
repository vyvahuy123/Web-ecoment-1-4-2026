namespace Application.Common.Interfaces;

/// <summary>
/// Service để hash và verify password.
/// Infrastructure sẽ implement bằng BCrypt hoặc PBKDF2.
/// </summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

/// <summary>
/// Lấy thông tin user đang đăng nhập từ HTTP context.
/// Infrastructure/WebApi sẽ implement.
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Username { get; }
    bool IsAuthenticated { get; }
}
/// <summary>
/// Cache abstraction.
/// </summary>
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default);
    Task RemoveAsync(string key, CancellationToken ct = default);
}
