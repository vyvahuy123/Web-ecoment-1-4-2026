const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Home/Home.jsx';
let home = fs.readFileSync(path, 'utf8');
const lines = home.split('\n');

// Thay dòng 377-381 (index 376-380)
lines[376] = '                    <div className="ec-product-price">\r';
lines[377] = '                      {p.salePrice ? (\r\n                        <>\r\n                          <span className="ec-price" style={{ color: "red", fontWeight: "bold" }}>\r\n                            {Number(p.salePrice).toLocaleString("vi-VN")}₫\r\n                          </span>\r\n                          <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.85em", marginLeft: 6 }}>\r\n                            {Number(p.price).toLocaleString("vi-VN")}₫\r\n                          </span>\r\n                        </>\r\n                      ) : (\r\n                        <span className="ec-price">{Number(p.price).toLocaleString("vi-VN")}₫</span>\r\n                      )}\r';
lines[378] = '\r';
lines[379] = '\r';
lines[380] = '                    </div>\r';

fs.writeFileSync(path, lines.join('\n'));
console.log('Done');
