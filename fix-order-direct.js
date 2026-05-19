const fs = require('fs');
const path = 'E:/CleanArchitecture/src/Application/Features/Orders/Commands/CreateOrderCommand.cs';
let code = fs.readFileSync(path, 'utf8');

// Tìm và in ra đoạn xung quanh dòng 69-72 để debug whitespace
const lines = code.split('\n');
lines.forEach((l, i) => {
  if (i >= 68 && i <= 73) {
    console.log(`Line ${i+1}: |${JSON.stringify(l)}|`);
  }
});
