const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Orders/Commands/CreateOrderCommand.cs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `            order.AddItem(OrderItem.Create(order.Id, product, quantity, price));`,
  `            order.AddItem(OrderItem.Create(order.Id, product, quantity, priceOverride: price));`
);

fs.writeFileSync(path, code);
console.log('Done');
