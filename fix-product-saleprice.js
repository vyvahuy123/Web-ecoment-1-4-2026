const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Domain/Entities/Product.cs';
let code = fs.readFileSync(path, 'utf8');

// Thêm SalePrice property sau Price
code = code.replace(
  '    public decimal Price { get; private set; }',
  '    public decimal Price { get; private set; }\n    public decimal? SalePrice { get; private set; }'
);

// Thêm SalePrice vào Update method
code = code.replace(
  `    public Result Update(string name, decimal price, string? description, string? imageUrl, Guid? categoryId)`,
  `    public Result Update(string name, decimal price, string? description, string? imageUrl, Guid? categoryId, decimal? salePrice = null)`
);

code = code.replace(
  `        Name = name.Trim();
        Price = price;
        Description = description?.Trim();
        ImageUrl = imageUrl;`,
  `        Name = name.Trim();
        Price = price;
        SalePrice = (salePrice.HasValue && salePrice.Value > 0 && salePrice.Value < price) ? salePrice : null;
        Description = description?.Trim();
        ImageUrl = imageUrl;`
);

fs.writeFileSync(path, code);
console.log('Done:', code.includes('SalePrice') ? 'OK' : 'FAILED');
