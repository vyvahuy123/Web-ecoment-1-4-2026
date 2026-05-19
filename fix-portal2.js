const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Admin/pages/CollectionsPage.jsx';
let code = fs.readFileSync(path, 'utf8');

// Fix import
code = code.replace(
  `import { useState } from "react";
import { createPortal } from "react-dom";`,
  `import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";`
);

// Fix ProductPanel to use mounted state
code = code.replace(
  `function ProductPanel({ collection, onClose, onRemove, onRefresh }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);`,
  `function ProductPanel({ collection, onClose, onRemove, onRefresh }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;`
);

// Fix createPortal call
code = code.replace(
  `  return createPortal(
    <div className="product-panel-overlay" style={{ paddingLeft: 0 }}>`,
  `  return createPortal(
    <div className="product-panel-overlay">`
);

fs.writeFileSync(path, code, 'utf8');
console.log('Done');
