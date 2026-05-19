const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Admin/pages/CollectionsPage.jsx';
let code = fs.readFileSync(path, 'utf8');

// Add createPortal import
code = code.replace(
  `"use client";
import { useState } from "react";`,
  `"use client";
import { useState } from "react";
import { createPortal } from "react-dom";`
);

// Wrap overlay in portal
code = code.replace(
  `  return (
    <div className="product-panel-overlay">`,
  `  return createPortal(
    <div className="product-panel-overlay" style={{ paddingLeft: 0 }}>`
);

code = code.replace(
  `    </div>
  );
}`,
  `    </div>,
    document.body
  );
}`
);

fs.writeFileSync(path, code, 'utf8');
console.log('Done');
