const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Orders/Commands/CreateOrderCommand.cs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    `            subTotal += product.Price * item.Quantity;
            orderItems.Add((product, item.Quantity, effectivePrice));`,
    `            var pCols = await _uow.Collections.GetCollectionsByProductIdAsync(product.Id, ct);
            var pActiveCol = pCols.FirstOrDefault(c => c.IsOnSaleNow());
            decimal effectivePrice = pActiveCol != null
                ? Math.Round(product.Price * (1 - pActiveCol.DiscountPercent / 100), 0)
                : product.Price;
            subTotal += effectivePrice * item.Quantity;
            orderItems.Add((product, item.Quantity, effectivePrice));`
);

fs.writeFileSync(path, code);
console.log('Done:', code.includes('effectivePrice = pActiveCol') ? 'OK' : 'REPLACE FAILED');
