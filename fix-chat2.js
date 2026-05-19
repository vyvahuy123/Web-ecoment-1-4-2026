const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/components/ChatWidget.jsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `  const handleOpen = () => {
    if (!token) { window.location.href = '/dang-nhap'; return; }
    setOpen(true);
  };`,
  `  const handleOpen = () => {
    const t = token || localStorage.getItem('token');
    if (!t) { window.location.href = '/dang-nhap'; return; }
    setOpen(true);
  };`
);

code = code.replace(
  `  const send = async () => {
    if (!token) { window.location.href = '/dang-nhap'; return; }`,
  `  const send = async () => {
    const t = token || localStorage.getItem('token');
    if (!t) { window.location.href = '/dang-nhap'; return; }`
);

fs.writeFileSync(path, code, 'utf8');
console.log('Done');
