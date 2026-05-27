const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Auth/Auth.jsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `<div className="au-forgot"><button type="button" style={{background:"none",border:"none",cursor:"pointer",color:"inherit",fontSize:"inherit",textDecoration:"underline"}} onClick={onForgot}>Quên mật khẩu?</button></div>`,
  `<div className="au-forgot"><a href="/quen-mat-khau">Quên mật khẩu?</a></div>`
);

fs.writeFileSync(path, code);
console.log('Done:', code.includes('/quen-mat-khau') ? 'OK' : 'FAILED');
