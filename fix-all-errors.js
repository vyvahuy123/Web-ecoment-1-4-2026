const fs = require('fs');

// Fix 1: ProductMapper - đúng thứ tự tham số theo record
fs.writeFileSync('E:/CleanArchitecture/src/Application/Features/Products/ProductMapper.cs', `using Application.Features.Products.DTOs;
using Domain.Entities;
namespace Application.Features.Products;
internal static class ProductMapper
{
    private static decimal? GetSalePrice(Product p, IEnumerable<Collection> collections)
    {
        var active = collections?.FirstOrDefault(c => c.IsOnSaleNow());
        if (active == null) return null;
        return Math.Round(p.Price * (1 - active.DiscountPercent / 100), 0);
    }

    public static ProductDto ToDto(Product p, IEnumerable<Collection>? collections = null) => new(
        p.Id, p.Name, p.Description, p.Price,
        GetSalePrice(p, collections ?? Enumerable.Empty<Collection>()),
        p.Stock, p.ImageUrl, p.IsActive, p.CategoryId, p.CreatedAt);

    public static ProductSummaryDto ToSummary(Product p, IEnumerable<Collection>? collections = null) => new(
        p.Id, p.Name, p.Price,
        GetSalePrice(p, collections ?? Enumerable.Empty<Collection>()),
        p.Stock, p.IsActive, p.ImageUrl, p.CategoryId);
}
`);
console.log('Fix 1 done - ProductMapper');

// Fix 2: GetProductQueries - fix Select lỗi
const queryPath = 'E:/CleanArchitecture/src/Application/Features/Products/Queries/GetProductQueries.cs';
let query = fs.readFileSync(queryPath, 'utf8');
query = query.replace(
  /using System\.Collections\.Generic;\n/g, ''
);
if (!query.startsWith('using System.Collections.Generic;')) {
  query = 'using System.Collections.Generic;\n' + query;
}
// Fix phần Select bị lỗi - đảm bảo dùng foreach
query = query.replace(
  /var summaries = new List<ProductSummaryDto>\(\);\s*foreach[\s\S]*?return new PagedResult<ProductSummaryDto>\(summaries, total, req\.Page, req\.PageSize\);/,
  `var summaries = new List<ProductSummaryDto>();
        foreach (var p in items)
        {
            var cols = await _uow.Collections.GetCollectionsByProductIdAsync(p.Id, ct);
            summaries.Add(ProductMapper.ToSummary(p, cols));
        }
        return new PagedResult<ProductSummaryDto>(summaries, total, req.Page, req.PageSize);`
);
fs.writeFileSync(queryPath, query);
console.log('Fix 2 done - GetProductQueries');

// Fix 3: CreateOrderCommand - fix tuple 3 phần tử
const orderPath = 'E:/CleanArchitecture/src/Application/Features/Orders/Commands/CreateOrderCommand.cs';
let order = fs.readFileSync(orderPath, 'utf8');

// Fix list declaration
order = order.replace(
  `        var orderItems = new List<(Product product, int quantity)>();`,
  `        var orderItems = new List<(Product product, int quantity, decimal price)>();`
);

// Fix Add nếu chưa có price
order = order.replace(
  /orderItems\.Add\(\(product, item\.Quantity\)\);/,
  `// replaced below`
);

// Đảm bảo dòng Add có đủ 3 phần tử
if (!order.includes('orderItems.Add((product, item.Quantity, effectivePrice))')) {
  order = order.replace(
    `// replaced below`,
    `orderItems.Add((product, item.Quantity, effectivePrice));`
  );
} else {
  order = order.replace(`// replaced below`, '');
}

// Fix foreach deconstruct
order = order.replace(
  /foreach \(var \(product, quantity\) in orderItems\)/,
  `foreach (var (product, quantity, price) in orderItems)`
);
order = order.replace(
  /foreach \(var \(product, quantity, price\) in orderItems\)\s*\{[\s\S]*?order\.AddItem\(OrderItem\.Create\(order\.Id, product, quantity\)\);/,
  `foreach (var (product, quantity, price) in orderItems)
        {
            order.AddItem(OrderItem.Create(order.Id, product, quantity, priceOverride: price));`
);

fs.writeFileSync(orderPath, order);
console.log('Fix 3 done - CreateOrderCommand');

