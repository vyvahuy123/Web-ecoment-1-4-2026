namespace Application.Features.Products.DTOs;

public record ProductDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    int Stock,
    string? ImageUrl,
    bool IsActive,
    Guid CategoryId,
    DateTime CreatedAt
);

public record ProductSummaryDto(
    Guid Id,
    string Name,
    decimal Price,
    int Stock,
    bool IsActive,
    string? ImageUrl
);
