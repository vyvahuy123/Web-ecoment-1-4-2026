const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/Commands/ProductCommands.cs';
let code = fs.readFileSync(path, 'utf8');

// Thêm SalePrice vào CreateProductCommand
code = code.replace(
  `public record CreateProductCommand(
    string Name,
    decimal Price,
    Guid? CategoryId,
    string? Description = null,
    string? ImageUrl = null
) : IRequest<ProductDto>;`,
  `public record CreateProductCommand(
    string Name,
    decimal Price,
    Guid? CategoryId,
    string? Description = null,
    string? ImageUrl = null,
    decimal? SalePrice = null
) : IRequest<ProductDto>;`
);

// Thêm SalePrice vào UpdateProductCommand - xem tên record
const updateMatch = code.match(/public record Update\w+Command\([^)]+\)/);
if (updateMatch) console.log('Update command found:', updateMatch[0].slice(0, 100));

fs.writeFileSync(path, code);
console.log('Done CreateCommand');
