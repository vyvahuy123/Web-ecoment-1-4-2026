const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Admin/pages/CollectionsPage.jsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
  `import { useFetch } from "../../../hooks/useFetch";`,
  `import { useFetch } from "@/hooks/useFetch";`
);
fs.writeFileSync(path, code, 'utf8');
console.log('Done');
