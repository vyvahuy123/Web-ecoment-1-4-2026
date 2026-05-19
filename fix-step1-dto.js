const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/DTOs/ProductDto.cs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `public record ProductSummaryDto(
    Guid Id,
    string Name,
    decimal Price,
    int Stock,
    bool IsActive,
    string? ImageUrl,
    Guid? CategoryId,
    int TotalSold = 0
);`,
  `public record ProductSummaryDto(
    Guid Id,
    string Name,
    decimal Price,
    decimal? SalePrice,
    int Stock,
    bool IsActive,
    string? ImageUrl,
    Guid? CategoryId,
    int TotalSold = 0
);`
);

code = code.replace(
  `public record ProductDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    int Stock,
    string? ImageUrl,
    bool IsActive,
    Guid CategoryId,
    DateTime CreatedAt
);`,
  `public record ProductDto(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    decimal? SalePrice,
    int Stock,
    string? ImageUrl,
    bool IsActive,
    Guid CategoryId,
    DateTime CreatedAt
);`
);

fs.writeFileSync(path, code);
console.log('Done');
