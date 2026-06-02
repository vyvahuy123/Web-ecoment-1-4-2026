const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/ProductMapper.cs';
let code = fs.readFileSync(path, 'utf8');
console.log('Current mapper:', code);
