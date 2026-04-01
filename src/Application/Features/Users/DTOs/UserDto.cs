namespace Application.Features.Users.DTOs;

public record UserDto(
    Guid Id,
    string Username,
    string Email,
    string? FullName,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    IEnumerable<string> Roles
);

public record UserSummaryDto(
    Guid Id,
    string Username,
    string Email,
    string? FullName,
    bool IsActive
);
