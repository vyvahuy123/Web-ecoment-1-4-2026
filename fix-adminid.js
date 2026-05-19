const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/components/ChatWidget.jsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `fetch('/api/chat/admin-id')`,
  `fetch('http://localhost:5000/api/chat/admin-id')`
);

fs.writeFileSync(path, code, 'utf8');
console.log('Done');
