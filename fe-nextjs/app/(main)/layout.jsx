"use client";
import { useCart } from "@/contexts/CartContext.jsx";
import CartDrawer from "@/components/CartDrawer.jsx";
import MainLayout from "@/layouts/MainLayout.jsx";

function InnerLayout({ children }) {
  const { cartCount, setCartOpen } = useCart();
  return (
    <MainLayout cartCount={cartCount} onCartOpen={() => setCartOpen(true)}>
      <CartDrawer />
      {children}
    </MainLayout>
  );
}

export default function MainGroupLayout({ children }) {
  return <InnerLayout>{children}</InnerLayout>;
}
