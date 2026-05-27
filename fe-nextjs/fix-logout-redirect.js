const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Navbar/Navbar.jsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `    onLogout?.();
    router.push("/");`,
  `    onLogout?.();
    router.push("/dang-nhap");`
);

fs.writeFileSync(path, code);
console.log('Done:', code.includes('router.push("/dang-nhap")') ? 'OK' : 'FAILED');
