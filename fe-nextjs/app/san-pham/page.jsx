"use client";
import { useCallback } from "react";
import { useCart } from "@/contexts/CartContext.jsx";
import Products from "../../page/Products/Products.jsx";

export default function SanPhamPage() {
  const { addItem } = useCart();
  const onAddCart = useCallback(async (p) => {
    try { await addItem(p.id, 1); }
    catch (e) { console.error("Thêm vào giỏ thất bại", e); }
  }, [addItem]);

  return <Products onAddCart={onAddCart} />;
}
