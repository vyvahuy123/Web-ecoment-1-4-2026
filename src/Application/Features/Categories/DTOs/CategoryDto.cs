namespace Application.Categories.DTOs;

public sealed record CategoryDto(
    Guid Id,
    string Name,
    string? Description
);