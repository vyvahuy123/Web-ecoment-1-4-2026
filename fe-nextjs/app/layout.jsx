"use client";
import { CartProvider } from "@/contexts/CartContext.jsx";
import { WishlistProvider } from "@/contexts/WishlistContext.jsx";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/index.css";
import "@/App.css";

export default function RootLayout({ children }) {
  const [showExpired, setShowExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = () => setShowExpired(true);
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, []);

  const handleClose = () => {
    setShowExpired(false);
    router.push("/dang-nhap");
  };

  return (
    <html lang="vi">
      <body>
        <CartProvider>
          <WishlistProvider>
            {children}
            {showExpired && (
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{background:"#fff",borderRadius:"8px",padding:"40px 32px",maxWidth:"380px",width:"90%",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
                  <div style={{fontSize:"48px",marginBottom:"16px"}}>⚠️</div>
                  <h3 style={{margin:"0 0 10px",fontSize:"18px",fontWeight:"600",color:"#0a0a0a"}}>Phiên đăng nhập hết hạn</h3>
                  <p style={{margin:"0 0 28px",color:"#6b6b6b",fontSize:"14px",lineHeight:"1.7"}}>Tài khoản của bạn đã được đăng nhập từ thiết bị khác. Vui lòng đăng nhập lại.</p>
                  <button onClick={handleClose} style={{background:"#0a0a0a",color:"#fff",border:"none",borderRadius:"4px",padding:"12px 32px",fontSize:"13px",fontWeight:"500",cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase"}}>
                    Đăng nhập lại
                  </button>
                </div>
              </div>
            )}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}