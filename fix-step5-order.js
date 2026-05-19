const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Orders/Commands/CreateOrderCommand.cs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `            subTotal += product.Price * item.Quantity;
            orderItems.Add((product, item.Quantity));`,
  `            var pCols = await _uow.Collections.GetCollectionsByProductIdAsync(product.Id, ct);
            var pActiveCol = pCols.FirstOrDefault(c => c.IsOnSaleNow());
            decimal effectivePrice = pActiveCol != null
                ? Math.Round(product.Price * (1 - pActiveCol.DiscountPercent / 100), 0)
                : product.Price;
            subTotal += effectivePrice * item.Quantity;
            orderItems.Add((product, item.Quantity, effectivePrice));`
);

// Fix tuple type
code = code.replace(
  `        var orderItems = new List<(Product product, int quantity)>();`,
  `        var orderItems = new List<(Product product, int quantity, decimal price)>();`
);

// Fix foreach dùng price mới
code = code.replace(
  `        foreach (var (product, quantity) in orderItems)
        {
            order.AddItem(OrderItem.Create(order.Id, product, quantity));`,
  `        foreach (var (product, quantity, price) in orderItems)
        {
            order.AddItem(OrderItem.Create(order.Id, product, quantity, price));`
);

fs.writeFileSync(path, code);
console.log('Done');
