const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Admin/styles/CollectionsPage.css';
let css = fs.readFileSync(path, 'utf8');

css = css.replace(
`.product-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}`,
`.product-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}`
);

fs.writeFileSync(path, css, 'utf8');
console.log('Done');
