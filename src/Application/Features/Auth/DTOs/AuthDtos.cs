namespace Application.Features.Auth.DTOs;

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiry,
    UserInfo User
);

public record UserInfo(
    Guid Id,
    string Username,
    string Email,
    string? FullName,
    IEnumerable<string> Roles
);

public record RefreshTokenResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiry
);
