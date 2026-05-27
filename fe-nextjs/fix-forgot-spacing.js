const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Auth/ForgotPassword.jsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `                    <button className="au-submit" type="submit" disabled={loading}>
                      {loading ? <span className="au-spinner" /> : "Gửi mã xác nhận"}
                    </button>`,
  `                    <button className="au-submit" type="submit" disabled={loading} style={{ marginTop: 16 }}>
                      {loading ? <span className="au-spinner" /> : "Gửi mã xác nhận"}
                    </button>`
);

fs.writeFileSync(path, code);
console.log('Done');
