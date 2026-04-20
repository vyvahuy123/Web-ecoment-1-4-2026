import { useEffect, useState, useCallback } from "react";
import CartService from "@/services/cart.service";

const fmt = (n) => Number(n).toLocaleString("vi-VN");
const BASE_URL = "http://localhost:5000";

function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

export default function CartDrawer({ open, onClose, onCartCountChange }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const data = await CartService.getMyCart();
      setCart(data);
      onCartCountChange?.(data.totalItems ?? 0);
    } catch { setCart(null); }
    finally { setLoading(false); }
  }, [onCartCountChange]);

  useEffect(() => { if (open) fetchCart(); }, [open, fetchCart]);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleUpdateQty = async (productId, newQty) => {
  if (newQty < 1) return;
  // Optimistic update — cập nhật UI ngay
  setCart((prev) => {
    if (!prev) return prev;
    const items = prev.items.map((i) =>
      i.productId === productId
        ? { ...i, quantity: newQty, totalPrice: i.unitPrice * newQty }
        : i
    );
    const grandTotal = items.reduce((s, i) => s + i.totalPrice, 0);
    const totalItems = items.reduce((s, i) => s + i.quantity, 0);
    return { ...prev, items, grandTotal, totalItems };
  });
  // Gọi API ngầm
  try {
    await CartService.updateItem(productId, newQty);
  } catch {
    // Nếu lỗi thì fetch lại
    fetchCart();
  }
};

  const handleRemove = async (productId) => {
  setCart((prev) => {
    if (!prev) return prev;
    const items = prev.items.filter((i) => i.productId !== productId);
    const grandTotal = items.reduce((s, i) => s + i.totalPrice, 0);
    const totalItems = items.reduce((s, i) => s + i.quantity, 0);
    onCartCountChange?.(totalItems);
    return { ...prev, items, grandTotal, totalItems };
  });
  try {
    await CartService.removeItem(productId);
  } catch {
    fetchCart();
  }
};

  const handleClear = async () => {
    setLoading(true);
    try { await CartService.clear(); await fetchCart(); }
    finally { setLoading(false); }
  };

  const items = cart?.items ?? [];
  const grandTotal = cart?.grandTotal ?? 0;

  return (
    <>
      <div onClick={onClose} style={{
        position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,
        opacity:open?1:0,pointerEvents:open?"auto":"none",transition:"opacity 0.3s ease",
      }}/>
      <div style={{
        position:"fixed",top:0,right:0,bottom:0,width:"min(420px, 100vw)",
        background:"#fff",zIndex:1001,display:"flex",flexDirection:"column",
        transform:open?"translateX(0)":"translateX(100%)",
        transition:"transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        boxShadow:"-4px 0 24px rgba(0,0,0,0.12)",
      }}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:"1px solid #f0f0f0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>🛒</span>
            <span style={{fontWeight:700,fontSize:18}}>Giỏ hàng</span>
            {items.length > 0 && (
              <span style={{background:"#111",color:"#fff",borderRadius:999,padding:"2px 8px",fontSize:12,fontWeight:600}}>
                {cart?.totalItems ?? 0}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#666",padding:4}}>✕</button>
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 24px"}}>
          {loading ? (
            <div style={{textAlign:"center",padding:"60px 0",color:"#999"}}>
              <div style={{fontSize:32,marginBottom:12}}>⏳</div>
              <p>Đang tải giỏ hàng...</p>
            </div>
          ) : !localStorage.getItem("token") ? (
            <div style={{textAlign:"center",padding:"60px 0"}}>
              <div style={{fontSize:48,marginBottom:16}}>🔐</div>
              <p style={{color:"#555",marginBottom:20}}>Vui lòng đăng nhập để xem giỏ hàng</p>
              <a href="/dang-nhap" style={{background:"#111",color:"#fff",padding:"10px 24px",borderRadius:8,textDecoration:"none",fontWeight:600,fontSize:14}}>Đăng nhập</a>
            </div>
          ) : items.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px 0"}}>
              <div style={{fontSize:48,marginBottom:16}}>🛒</div>
              <p style={{color:"#555",marginBottom:8,fontWeight:600}}>Giỏ hàng trống</p>
              <p style={{color:"#999",fontSize:14,marginBottom:24}}>Thêm sản phẩm vào giỏ để bắt đầu</p>
              <button onClick={onClose} style={{background:"#111",color:"#fff",border:"none",padding:"10px 24px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:14}}>Tiếp tục mua sắm</button>
            </div>
          ) : (
            <>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
                <button onClick={handleClear} style={{background:"none",border:"none",color:"#e74c3c",fontSize:13,cursor:"pointer",textDecoration:"underline"}}>Xóa tất cả</button>
              </div>
              {items.map((item) => (
                <div key={item.cartItemId} style={{display:"flex",gap:14,marginBottom:16,padding:14,borderRadius:12,border:"1px solid #f0f0f0",background:updatingId===item.productId?"#fafafa":"#fff",transition:"background 0.2s"}}>
                  <div style={{width:72,height:72,borderRadius:10,background:"#f5f5f5",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {getImageUrl(item.productImageUrl)
                      ? <img src={getImageUrl(item.productImageUrl)} alt={item.productName} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none"}}/>
                      : <span style={{fontSize:28}}>🛍️</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:600,fontSize:14,marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.productName}</p>
                    <p style={{color:"#e74c3c",fontWeight:700,fontSize:14,marginBottom:8}}>{fmt(item.unitPrice)}₫</p>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <button onClick={()=>handleUpdateQty(item.productId,item.quantity-1)} disabled={updatingId===item.productId||item.quantity<=1} style={{width:28,height:28,borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:item.quantity<=1?"not-allowed":"pointer",fontSize:16,fontWeight:600}}>−</button>
                      <span style={{fontWeight:600,fontSize:14,minWidth:20,textAlign:"center"}}>{item.quantity}</span>
                      <button onClick={()=>handleUpdateQty(item.productId,item.quantity+1)} disabled={updatingId===item.productId} style={{width:28,height:28,borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer",fontSize:16,fontWeight:600}}>+</button>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"space-between"}}>
                    <span style={{fontWeight:700,fontSize:14}}>{fmt(item.totalPrice)}₫</span>
                    <button onClick={()=>handleRemove(item.productId)} disabled={updatingId===item.productId} style={{background:"none",border:"none",color:"#bbb",cursor:"pointer",fontSize:18,padding:2}} onMouseEnter={e=>e.currentTarget.style.color="#e74c3c"} onMouseLeave={e=>e.currentTarget.style.color="#bbb"}>🗑</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{borderTop:"1px solid #f0f0f0",padding:"20px 24px",background:"#fff"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <span style={{color:"#555",fontSize:15}}>Tổng cộng</span>
              <span style={{fontWeight:800,fontSize:18,color:"#111"}}>{fmt(grandTotal)}₫</span>
            </div>
            <a href="/cart" onClick={onClose} style={{display:"block",textAlign:"center",background:"#111",color:"#fff",padding:14,borderRadius:10,textDecoration:"none",fontWeight:700,fontSize:15}}>Tiến hành thanh toán →</a>
            <button onClick={onClose} style={{display:"block",width:"100%",textAlign:"center",background:"none",border:"1px solid #ddd",color:"#555",padding:11,borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:14,marginTop:10}}>Tiếp tục mua sắm</button>
          </div>
        )}
      </div>
    </>
  );
}
