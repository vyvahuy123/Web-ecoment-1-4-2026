const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Infrastructure/Persistence/AppDbContext.cs';
let db = fs.readFileSync(path, 'utf8');
db = db.replace(
    '    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();',
    '    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();\n    public DbSet<Collection> Collections => Set<Collection>();\n    public DbSet<CollectionProduct> CollectionProducts => Set<CollectionProduct>();'
);
fs.writeFileSync(path, db, 'utf8');
console.log('Done');
