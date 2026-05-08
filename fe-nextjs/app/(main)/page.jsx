"use client";
import { useCallback } from "react";
import { useCart } from "@/contexts/CartContext.jsx";
import Home from "@/page/Home/Home.jsx";
export default function HomePage() {
  const { addItem } = useCart();
  const addToCart = useCallback(async (p) => {
    try { await addItem(p.id, 1); } catch (e) { console.error(e); }
  }, [addItem]);
  return <Home addToCart={addToCart} />;
}
