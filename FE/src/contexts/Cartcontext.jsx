import { createContext, useContext, useState, useCallback, useEffect } from "react";
import CartService from "@/services/cart.service";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setCart(null); return; }
    setLoading(true);
    try {
      const data = await CartService.getMyCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart khi login/logout
  useEffect(() => {
    fetchCart();
    const interval = setInterval(() => {
      if (localStorage.getItem("token")) fetchCart();
    }, 30000); // refresh mỗi 30s
    return () => clearInterval(interval);
  }, [fetchCart]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    await CartService.addItem({ productId, quantity });
    await fetchCart();
  }, [fetchCart]);

  const updateItem = useCallback(async (productId, newQty) => {
    if (newQty < 1) return;
    // Optimistic
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
    try {
      await CartService.updateItem(productId, newQty);
    } catch {
      fetchCart();
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (productId) => {
    // Optimistic
    setCart((prev) => {
      if (!prev) return prev;
      const items = prev.items.filter((i) => i.productId !== productId);
      const grandTotal = items.reduce((s, i) => s + i.totalPrice, 0);
      const totalItems = items.reduce((s, i) => s + i.quantity, 0);
      return { ...prev, items, grandTotal, totalItems };
    });
    try {
      await CartService.removeItem(productId);
    } catch {
      fetchCart();
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    setCart((prev) => prev ? { ...prev, items: [], grandTotal: 0, totalItems: 0 } : prev);
    try {
      await CartService.clear();
    } catch {
      fetchCart();
    }
  }, [fetchCart]);

  const cartCount = cart?.totalItems ?? 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      cartOpen,
      cartCount,
      setCartOpen,
      fetchCart,
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}