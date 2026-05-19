const fs = require('fs');

fs.mkdirSync('E:/CleanArchitecture/src/Application/Features/Collections/DTOs', { recursive: true });

fs.writeFileSync('E:/CleanArchitecture/src/Application/Features/Collections/DTOs/CollectionDto.cs', `namespace Application.Features.Collections.DTOs;

public record CollectionDto(
    Guid Id,
    string Name,
    string? Description,
    string? ImageUrl,
    decimal DiscountPercent,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive,
    bool IsOnSaleNow,
    DateTime CreatedAt
);

public record CollectionDetailDto(
    Guid Id,
    string Name,
    string? Description,
    string? ImageUrl,
    decimal DiscountPercent,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive,
    bool IsOnSaleNow,
    DateTime CreatedAt,
    IEnumerable<CollectionProductDto> Products
);

public record CollectionProductDto(
    Guid ProductId,
    string Name,
    decimal Price,
    decimal SalePrice,
    string? ImageUrl,
    bool IsActive
);
`);

console.log('Done');
