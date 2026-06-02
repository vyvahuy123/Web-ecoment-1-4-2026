const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/Commands/ProductCommands.cs';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

// Xóa dòng 62 (index 61 sau splice) - dòng trống
// và dòng 63 ) : IRequest<ProductDto>; - thêm vào cuối dòng 61
lines[60] = 'public record UpdateProductCommand(';
lines[61] = '    Guid Id, string Name, decimal Price, string? Description, string? ImageUrl, Guid? CategoryId, decimal? SalePrice = null';
lines.splice(62, 2, ') : IRequest<ProductDto>;'); // xóa dòng trống và ) cũ, thay bằng 1 dòng

fs.writeFileSync(path, lines.join('\n'));
console.log('Lines 60-65:');
const newLines = fs.readFileSync(path, 'utf8').split('\n');
newLines.slice(59, 65).forEach((l, i) => console.log(`${60+i}: ${l}`));
