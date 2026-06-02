const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/Commands/ProductCommands.cs';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

// Tìm chính xác dòng UpdateProductCommand
const updateIdx = lines.findIndex(l => l.trim() === 'public record UpdateProductCommand(');
console.log('UpdateProductCommand at line:', updateIdx + 1);
console.log('Line+1:', lines[updateIdx + 1]);
console.log('Line+2:', lines[updateIdx + 2]);

// Chỉ sửa dòng updateIdx+1 (params line)
if (lines[updateIdx + 1].includes('Guid Id') && !lines[updateIdx + 1].includes('SalePrice')) {
  lines[updateIdx + 1] = '    Guid Id, string Name, decimal Price, string? Description, string? ImageUrl, Guid? CategoryId, decimal? SalePrice = null';
  console.log('Fixed!');
}

// Fix handler
const handlerIdx = lines.findIndex(l => l.includes('product.Update(req.Name') && !l.includes('req.SalePrice'));
if (handlerIdx !== -1) {
  lines[handlerIdx] = lines[handlerIdx].replace(
    'product.Update(req.Name, req.Price, req.Description, req.ImageUrl, req.CategoryId)',
    'product.Update(req.Name, req.Price, req.Description, req.ImageUrl, req.CategoryId, req.SalePrice)'
  );
  console.log('Handler fixed!');
}

fs.writeFileSync(path, lines.join('\n'));
