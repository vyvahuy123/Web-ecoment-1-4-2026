const fs = require('fs');

// ── Fix Products.jsx ──
const pPath = 'E:/CleanArchitecture/fe-nextjs/page/Products/Products.jsx';
let p = fs.readFileSync(pPath, 'utf8').split('\n');

// Thêm badge sau dòng 65 (index 64) - sau </div> đóng ảnh
p.splice(64, 0,
  '          {p.salePrice && (',
  '            <div style={{ position: "absolute", top: 10, left: 10, background: "#e53935", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, zIndex: 2 }}>',
  '              -{Math.round((1 - p.salePrice / p.price) * 100)}%',
  '            </div>',
  '          )}'
);

// Tìm dòng "Tiết kiệm" cần thêm - sau span gạch ngang
const saveIdx = p.findIndex((l, i) => i > 60 && l.includes('pd-price') && l.includes('toLocaleString'));
// Tìm dòng }) : ( sau span
const closingIdx = p.findIndex((l, i) => i > saveIdx && l.includes('pd-price') && !l.includes('salePrice') && l.includes('toLocaleString'));
if (closingIdx !== -1) {
  p.splice(closingIdx, 0,
    '              <span style={{ fontSize: "0.8em", color: "#e53935", marginLeft: 4 }}>',
    '                Tiết kiệm {Number(p.price - p.salePrice).toLocaleString("vi-VN")}₫',
    '              </span>'
  );
}

fs.writeFileSync(pPath, p.join('\n'));
console.log('Products.jsx done');

// ── Fix ProductDetail.jsx ──
const dPath = 'E:/CleanArchitecture/fe-nextjs/page/Products/ProductDetail.jsx';
let d = fs.readFileSync(dPath, 'utf8').split('\n');

const priceIdx = d.findIndex(l => l.includes('clamp(24px') && l.includes('e74c3c'));
if (priceIdx !== -1) {
  // Thay dòng price + dòng tiếp theo
  d.splice(priceIdx - 1, 3,
    '            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>',
    '              <p style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#e74c3c", margin: 0 }}>',
    '                {fmt(displayPrice)}₫',
    '              </p>',
    '              {originalPrice && (',
    '                <span style={{ background: "#e53935", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 4 }}>',
    '                  -{Math.round((1 - displayPrice / originalPrice) * 100)}%',
    '                </span>',
    '              )}',
    '            </div>',
    '            {originalPrice && (',
    '              <div style={{ marginBottom: 12 }}>',
    '                <span style={{ textDecoration: "line-through", color: "#999", fontSize: 16 }}>{fmt(originalPrice)}₫</span>',
    '                <span style={{ color: "#e53935", fontSize: 13, marginLeft: 8 }}>Tiết kiệm {fmt(originalPrice - displayPrice)}₫</span>',
    '              </div>',
    '            )}'
  );
}
fs.writeFileSync(dPath, d.join('\n'));
console.log('ProductDetail.jsx done');

// ── Fix Home.jsx - badge ──
const hPath = 'E:/CleanArchitecture/fe-nextjs/page/Home/Home.jsx';
let h = fs.readFileSync(hPath, 'utf8').split('\n');
const wishlistIdx = h.findIndex(l => l.includes('ec-wishlist') && l.includes('♡'));
if (wishlistIdx !== -1) {
  h.splice(wishlistIdx + 1, 0,
    '                  {p.salePrice && (',
    '                    <div style={{ position: "absolute", top: 10, left: 10, background: "#e53935", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, zIndex: 2 }}>',
    '                      -{Math.round((1 - p.salePrice / p.price) * 100)}%',
    '                    </div>',
    '                  )}'
  );
}
fs.writeFileSync(hPath, h.join('\n'));
console.log('Home.jsx done');
