const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/Commands/ProductCommands.cs';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

// Dòng 61 (index 60) = "public record UpdateProductCommand("  - giữ nguyên
// Dòng 62 (index 61) = "    Guid Id...CategoryId" - thêm SalePrice
// Dòng 63 (index 62) = ") : IRequest<ProductDto>;" - giữ nguyên
lines[61] = '    Guid Id, string Name, decimal Price, string? Description, string? ImageUrl, Guid? CategoryId, decimal? SalePrice = null';

fs.writeFileSync(path, lines.join('\n'));
console.log('Line 62:', lines[61]);
console.log('Done:', lines[61].includes('SalePrice') ? 'OK' : 'FAILED');
