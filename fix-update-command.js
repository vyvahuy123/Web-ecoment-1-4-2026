const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/Commands/ProductCommands.cs';
let code = fs.readFileSync(path, 'utf8');

// Thêm SalePrice vào UpdateProductCommand
code = code.replace(
  `public record UpdateProductCommand(
    Guid Id, string Name, decimal Price, string? Description, string? ImageUrl, Guid? CategoryId
) : IRequest<ProductDto>;`,
  `public record UpdateProductCommand(
    Guid Id, string Name, decimal Price, string? Description, string? ImageUrl, Guid? CategoryId, decimal? SalePrice = null
) : IRequest<ProductDto>;`
);

// Thêm SalePrice vào Update call
code = code.replace(
  `        var result = product.Update(req.Name, req.Price, req.Description, req.ImageUrl, req.CategoryId);`,
  `        var result = product.Update(req.Name, req.Price, req.Description, req.ImageUrl, req.CategoryId, req.SalePrice);`
);

fs.writeFileSync(path, code);
console.log('Done:', code.includes('req.SalePrice') ? 'OK' : 'FAILED');
