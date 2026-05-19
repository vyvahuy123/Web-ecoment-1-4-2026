const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Domain/Entities/Order.cs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `    public static OrderItem Create(Guid orderId, Product product, int quantity, ProductVariant? variant = null)
        => new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            ProductId = product.Id,
            VariantId = variant?.Id,
            ProductName = product.Name,
            ProductImageUrl = variant?.ImageUrl ?? product.ImageUrl,
            VariantColor = variant?.Color,
            VariantSize = variant?.Size,
            UnitPrice = variant?.Price ?? product.Price,
            Quantity = quantity,
            TotalPrice = (variant?.Price ?? product.Price) * quantity
        };`,
  `    public static OrderItem Create(Guid orderId, Product product, int quantity, decimal? priceOverride = null, ProductVariant? variant = null)
    {
        var basePrice = variant?.Price ?? product.Price;
        var unitPrice = priceOverride ?? basePrice;
        return new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            ProductId = product.Id,
            VariantId = variant?.Id,
            ProductName = product.Name,
            ProductImageUrl = variant?.ImageUrl ?? product.ImageUrl,
            VariantColor = variant?.Color,
            VariantSize = variant?.Size,
            UnitPrice = unitPrice,
            Quantity = quantity,
            TotalPrice = unitPrice * quantity
        };
    }`
);

fs.writeFileSync(path, code);
console.log('Done');
