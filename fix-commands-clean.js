const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/Commands/ProductCommands.cs';
let code = fs.readFileSync(path, 'utf8');

// Fix CreateProductCommand
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

// Fix UpdateProductCommand  
code = code.replace(
`public record UpdateProductCommand(
    Guid Id, string Name, decimal Price, string? Description, string? ImageUrl, Guid? CategoryId
) : IRequest<ProductDto>;`,
`public record UpdateProductCommand(
    Guid Id, string Name, decimal Price, string? Description, string? ImageUrl, Guid? CategoryId, decimal? SalePrice = null
) : IRequest<ProductDto>;`
);

// Fix Update handler call
code = code.replace(
`        var result = product.Update(req.Name, req.Price, req.Description, req.ImageUrl, req.CategoryId);`,
`        var result = product.Update(req.Name, req.Price, req.Description, req.ImageUrl, req.CategoryId, req.SalePrice);`
);

fs.writeFileSync(path, code);
console.log('CreateCommand:', code.includes('decimal? SalePrice = null\n) : IRequest<ProductDto>;') ? 'OK' : 'check');
console.log('UpdateCommand:', code.includes('Guid? CategoryId, decimal? SalePrice = null') ? 'OK' : 'FAILED');
console.log('Handler:', code.includes('req.SalePrice') ? 'OK' : 'FAILED');
