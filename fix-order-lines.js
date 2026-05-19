const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Orders/Commands/CreateOrderCommand.cs';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

// Thay dòng 71 và 72 (index 70, 71)
lines[70] = '            var pCols = await _uow.Collections.GetCollectionsByProductIdAsync(product.Id, ct);\r';
lines[71] = '            var pActiveCol = pCols.FirstOrDefault(c => c.IsOnSaleNow());\r\n            decimal effectivePrice = pActiveCol != null\r\n                ? Math.Round(product.Price * (1 - pActiveCol.DiscountPercent / 100), 0)\r\n                : product.Price;\r\n            subTotal += effectivePrice * item.Quantity;\r\n            orderItems.Add((product, item.Quantity, effectivePrice));\r';

fs.writeFileSync(path, lines.join('\n'));
console.log('Done');
