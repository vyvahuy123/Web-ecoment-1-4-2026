const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Auth/Auth.jsx';
let code = fs.readFileSync(path, 'utf8');

// Thêm state showForgot vào export default Auth
code = code.replace(
  `export default function Auth({ defaultTab = "login", onLoginSuccess }) {
  const [tab, setTab] = useState(defaultTab);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("right");
  const [success, setSuccess] = useState(null);
  const router = useRouter();`,
  `export default function Auth({ defaultTab = "login", onLoginSuccess }) {
  const [tab, setTab] = useState(defaultTab);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("right");
  const [success, setSuccess] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const router = useRouter();`
);

// Thay <LoginForm> thêm props onForgot và wrap với showForgot
code = code.replace(
  `{tab === "login"
                ? <LoginForm onSuccess={handleSuccess} />`,
  `{tab === "login"
                ? showForgot
                  ? <ForgotPasswordFlow onBack={() => setShowForgot(false)} />
                  : <LoginForm onSuccess={handleSuccess} onForgot={() => setShowForgot(true)} />`
);

fs.writeFileSync(path, code);
console.log('Done:', code.includes('showForgot') ? 'OK' : 'FAILED');
