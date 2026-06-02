const fs = require('fs');

// Fix ProductDto - SalePrice đã có rồi từ trước (collection sale)
// Kiểm tra xem đã có chưa
const dtoPath = 'E:/CleanArchitecture/src/Application/Features/Products/DTOs/ProductDto.cs';
let dto = fs.readFileSync(dtoPath, 'utf8');
console.log('ProductDto current:', dto);
