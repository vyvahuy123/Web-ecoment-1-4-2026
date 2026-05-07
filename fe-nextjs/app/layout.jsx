"use client";
import { CartProvider } from "@/contexts/CartContext.jsx";
import { WishlistProvider } from "@/contexts/WishlistContext.jsx";
import "@/index.css";
import "@/App.css";

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
