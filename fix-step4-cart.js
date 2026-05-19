const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Carts/Commands/AddToCartCommand.cs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `        decimal unitPrice = product.Price;`,
  `        var productCols = await _uow.Collections.GetCollectionsByProductIdAsync(cmd.ProductId, ct);
        var activeCol = productCols.FirstOrDefault(c => c.IsOnSaleNow());
        decimal unitPrice = activeCol != null
            ? Math.Round(product.Price * (1 - activeCol.DiscountPercent / 100), 0)
            : product.Price;`
);

fs.writeFileSync(path, code);
console.log('Done');
