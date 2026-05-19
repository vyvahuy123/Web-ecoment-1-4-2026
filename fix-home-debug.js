const fs = require('fs');
let home = fs.readFileSync('E:/CleanArchitecture/fe-nextjs/page/Home/Home.jsx', 'utf8');
const lines = home.split('\n');
lines.forEach((l, i) => {
  if (i >= 373 && i <= 383) {
    console.log(`Line ${i+1}: |${JSON.stringify(l)}|`);
  }
});
