const fs = require('fs');

// Helper tính % giảm
const badgeStyle = `style={{ position: "absolute", top: 10, left: 10, background: "#e53935", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, zIndex: 2 }}`;

// ── Fix 1: Products.jsx - thêm badge vào ảnh card ──
let products = fs.readFileSync('E:/CleanArchitecture/fe-nextjs/page/Products/Products.jsx', 'utf8');
products = products.replace(
  `            {liked ? "♥" : "♡"}
          </button>
        </div>
      </div>`,
  `            {liked ? "♥" : "♡"}
          </button>
          {p.salePrice && (
            <div ${badgeStyle}>
              -{Math.round((1 - p.salePrice / p.price) * 100)}%
            </div>
          )}
        </div>
      </div>`
);

// Thêm "Tiết kiệm" vào phần giá
products = products.replace(
  `              <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.85em", marginLeft: 6 }}>
                {Number(p.price).toLocaleString("vi-VN")}₫
              </span>
            </>
          ) : (
            <span className="pd-price">{Number(p.price).toLocaleString("vi-VN")}₫</span>
          )}
        </div>
      </div>
    </div>
  );
}
function CategoryHero`,
  `              <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.85em", marginLeft: 6 }}>
                {Number(p.price).toLocaleString("vi-VN")}₫
              </span>
              <span style={{ fontSize: "0.8em", color: "#e53935", marginLeft: 4 }}>
                Tiết kiệm {Number(p.price - p.salePrice).toLocaleString("vi-VN")}₫
              </span>
            </>
          ) : (
            <span className="pd-price">{Number(p.price).toLocaleString("vi-VN")}₫</span>
          )}
        </div>
      </div>
    </div>
  );
}
function CategoryHero`
);

fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Products/Products.jsx', products);
console.log('Fix 1 done - Products.jsx:', products.includes('Tiết kiệm') ? 'OK' : 'FAILED');

// ── Fix 2: Home.jsx - thêm badge vào ec-product ──
let home = fs.readFileSync('E:/CleanArchitecture/fe-nextjs/page/Home/Home.jsx', 'utf8');
home = home.replace(
  `                  <button className="ec-wishlist">♡</button>
                  </div>
                  <div className="ec-product-info">`,
  `                  <button className="ec-wishlist">♡</button>
                  {p.salePrice && (
                    <div ${badgeStyle}>
                      -{Math.round((1 - p.salePrice / p.price) * 100)}%
                    </div>
                  )}
                  </div>
                  <div className="ec-product-info">`
);

home = home.replace(
  `                          <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.85em", marginLeft: 6 }}>
                            {Number(p.price).toLocaleString("vi-VN")}₫
                          </span>
                        </>
                      ) : (
                        <span className="ec-price">{Number(p.price).toLocaleString("vi-VN")}₫</span>
                      )}`,
  `                          <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.85em", marginLeft: 6 }}>
                            {Number(p.price).toLocaleString("vi-VN")}₫
                          </span>
                          <span style={{ fontSize: "0.8em", color: "#e53935", display: "block", marginTop: 2 }}>
                            Tiết kiệm {Number(p.price - p.salePrice).toLocaleString("vi-VN")}₫
                          </span>
                        </>
                      ) : (
                        <span className="ec-price">{Number(p.price).toLocaleString("vi-VN")}₫</span>
                      )}`
);

fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Home/Home.jsx', home);
console.log('Fix 2 done - Home.jsx:', home.includes('Tiết kiệm') ? 'OK' : 'FAILED');

// ── Fix 3: ProductDetail.jsx - thêm badge và tiết kiệm ──
let detail = fs.readFileSync('E:/CleanArchitecture/fe-nextjs/page/Products/ProductDetail.jsx', 'utf8');
detail = detail.replace(
  `            <p style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#e74c3c", marginBottom: 16 }}>
              {fmt(displayPrice)}₫
            </p>`,
  `            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#e74c3c", margin: 0 }}>
                {fmt(displayPrice)}₫
              </p>
              {originalPrice && (
                <span style={{ background: "#e53935", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 4 }}>
                  -{Math.round((1 - displayPrice / originalPrice) * 100)}%
                </span>
              )}
            </div>
            {originalPrice && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ textDecoration: "line-through", color: "#999", fontSize: 16 }}>{fmt(originalPrice)}₫</span>
                <span style={{ color: "#e53935", fontSize: 13, marginLeft: 8 }}>
                  Tiết kiệm {fmt(originalPrice - displayPrice)}₫
                </span>
              </div>
            )}`
);

fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Products/ProductDetail.jsx', detail);
console.log('Fix 3 done - ProductDetail.jsx:', detail.includes('Tiết kiệm') ? 'OK' : 'FAILED');
