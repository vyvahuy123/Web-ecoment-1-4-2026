"use client";
import { CartProvider, useCart } from "@/contexts/CartContext.jsx";
import { WishlistProvider } from "@/contexts/WishlistContext.jsx";
import CartDrawer from "@/components/CartDrawer.jsx";
import MainLayout from "@/layouts/MainLayout.jsx";
import "@/index.css";
import "@/App.css";

function InnerLayout({ children }) {
  const { cartCount, setCartOpen } = useCart();
  return (
    <MainLayout cartCount={cartCount} onCartOpen={() => setCartOpen(true)}>
      <CartDrawer />
      {children}
    </MainLayout>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <CartProvider>
          <WishlistProvider>
            <InnerLayout>{children}</InnerLayout>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
