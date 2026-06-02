const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Infrastructure/Persistence/Configurations/ProductRefreshTokenConfigurations.cs';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `        builder.Navigation(p => p.Images).HasField("_images");`,
  `        builder.Navigation(p => p.Images).HasField("_images");
        builder.Property(p => p.SalePrice).HasColumnName("sale_price").HasColumnType("decimal(18,2)").IsRequired(false);`
);

fs.writeFileSync(path, code);
console.log('Done:', code.includes('sale_price') ? 'OK' : 'FAILED');
