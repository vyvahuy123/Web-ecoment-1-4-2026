const fs = require('fs');

// Fix 1: Home.jsx
let home = fs.readFileSync('E:/CleanArchitecture/fe-nextjs/page/Home/Home.jsx', 'utf8');
home = home.replace(
  `                    <div className="ec-product-price">
                      <span className="ec-price">
                        {Number(p.price).toLocaleString("vi-VN")}₫
                      </span>
                    </div>`,
  `                    <div className="ec-product-price">
                      {p.salePrice ? (
                        <>
                          <span className="ec-price" style={{ color: "red", fontWeight: "bold" }}>
                            {Number(p.salePrice).toLocaleString("vi-VN")}₫
                          </span>
                          <span className="ec-price-old" style={{ textDecoration: "line-through", color: "#999", fontSize: "0.85em", marginLeft: 6 }}>
                            {Number(p.price).toLocaleString("vi-VN")}₫
                          </span>
                        </>
                      ) : (
                        <span className="ec-price">{Number(p.price).toLocaleString("vi-VN")}₫</span>
                      )}
                    </div>`
);
fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Home/Home.jsx', home);
console.log('Fix 1 done - Home.jsx:', home.includes('p.salePrice') ? 'OK' : 'FAILED');

// Fix 2: Products.jsx
let products = fs.readFileSync('E:/CleanArchitecture/fe-nextjs/page/Products/Products.jsx', 'utf8');
products = products.replace(
  `          <span className="pd-price">{Number(p.price).toLocaleString("vi-VN")}₫</span>`,
  `          {p.salePrice ? (
            <>
              <span className="pd-price" style={{ color: "red", fontWeight: "bold" }}>
                {Number(p.salePrice).toLocaleString("vi-VN")}₫
              </span>
              <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.85em", marginLeft: 6 }}>
                {Number(p.price).toLocaleString("vi-VN")}₫
              </span>
            </>
          ) : (
            <span className="pd-price">{Number(p.price).toLocaleString("vi-VN")}₫</span>
          )}`
);
fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Products/Products.jsx', products);
console.log('Fix 2 done - Products.jsx:', products.includes('p.salePrice') ? 'OK' : 'FAILED');

// Fix 3: ProductDetail.jsx
let detail = fs.readFileSync('E:/CleanArchitecture/fe-nextjs/page/Products/ProductDetail.jsx', 'utf8');
detail = detail.replace(
  `  const displayPrice = selectedVariant ? selectedVariant.price : product.price;`,
  `  const displayPrice = selectedVariant ? selectedVariant.price : (product.salePrice ?? product.price);
  const originalPrice = selectedVariant ? null : (product.salePrice ? product.price : null);`
);
fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Products/ProductDetail.jsx', detail);
console.log('Fix 3 done - ProductDetail.jsx:', detail.includes('product.salePrice') ? 'OK' : 'FAILED');

