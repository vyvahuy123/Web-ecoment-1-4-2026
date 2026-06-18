import { createContext, useContext, useState, useCallback, useEffect } from "react";
import WishlistService from "@/services/wishlist.service";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]); // array of WishListDto
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setWishlist([]); return; }
    setLoading(true);
    try {
      const data = await WishlistService.getMyWishlist();
      setWishlist(Array.isArray(data) ? data : []);
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const isWishlisted = useCallback((productId) => {
    return wishlist.some(w => w.productId === productId);
  }, [wishlist]);

  const toggleWishlist = useCallback(async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/dang-nhap"; return; }

    const already = wishlist.some(w => w.productId === productId);
    // Optimistic update
    if (already) {
      setWishlist(prev => prev.filter(w => w.productId !== productId));
      try { await WishlistService.remove(productId); }
      catch { fetchWishlist(); }
    } else {
      try {
        const newItem = await WishlistService.add(productId);
        setWishlist(prev => [...prev, newItem]);
      } catch { fetchWishlist(); }
    }
  }, [wishlist, fetchWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, loading, fetchWishlist, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}