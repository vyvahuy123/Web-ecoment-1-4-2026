"use client";
import { CartProvider } from "@/contexts/CartContext.jsx";
import { WishlistProvider } from "@/contexts/WishlistContext.jsx";
import "@/index.css";
import "@/App.css";

export default function AdminLayout({ children }) {
  return (
    <CartProvider>
      <WishlistProvider>
        {children}
      </WishlistProvider>
    </CartProvider>
  );
}
