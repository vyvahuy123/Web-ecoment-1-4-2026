const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Products/Commands/ProductCommands.cs';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

// Xóa dòng 61 (index 60) - dòng cũ không có SalePrice
// Thêm ) : IRequest<ProductDto>; sau dòng mới
lines.splice(60, 1); // xóa dòng cũ

// Dòng 61 bây giờ là dòng mới với SalePrice, thêm ) : IRequest<ProductDto>; vào sau
lines.splice(62, 0, ') : IRequest<ProductDto>;');

// Xóa dòng ) : IRequest<ProductDto>; cũ nếu còn
const oldClosingIdx = lines.findIndex((l, i) => i > 60 && i < 67 && l.trim() === ') : IRequest<ProductDto>;');
// Không xóa nếu là dòng vừa thêm

fs.writeFileSync(path, lines.join('\n'));
console.log('Done');
console.log('Lines 60-65:');
lines.slice(59, 65).forEach((l, i) => console.log(`${60+i}: ${l}`));
