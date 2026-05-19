const fs = require('fs');

const path = 'E:/CleanArchitecture/src/Infrastructure/Persistence/UnitOfWork.cs';
let code = fs.readFileSync(path, 'utf8');

// Add private field
code = code.replace(
    '    private IProductVariantRepository? _productVariants;',
    '    private IProductVariantRepository? _productVariants;\n    private ICollectionRepository? _collections;'
);

// Add public property
code = code.replace(
    '    public IBannerRepository Banners => new BannerRepository(_ctx);',
    '    public IBannerRepository Banners => new BannerRepository(_ctx);\n    public ICollectionRepository Collections => _collections ??= new CollectionRepository(_ctx);'
);

fs.writeFileSync(path, code, 'utf8');
console.log('Done');
