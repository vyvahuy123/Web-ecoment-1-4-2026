const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Auth/Auth.jsx';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

// Dòng 282 (index 281) - thêm showForgot state sau success state
lines.splice(281, 0, '  const [showForgot, setShowForgot] = useState(false);\r');

// Dòng 162 (index 161) - thêm onForgot prop vào LoginForm
lines[161] = 'function LoginForm({ onSuccess, onForgot }) {\r';

// Tìm dòng LoginForm onSuccess={handleSuccess} và thêm showForgot logic
const loginFormIdx = lines.findIndex(l => l.includes('? <LoginForm onSuccess={handleSuccess} />'));
if (loginFormIdx !== -1) {
  lines[loginFormIdx] = '                ? showForgot\r\n                  ? <ForgotPasswordFlow onBack={() => setShowForgot(false)} />\r\n                  : <LoginForm onSuccess={handleSuccess} onForgot={() => setShowForgot(true)} />\r';
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Done:', code.includes('showForgot') || lines.join('\n').includes('showForgot') ? 'OK' : 'FAILED');
