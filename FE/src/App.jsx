import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { CartProvider, useCart } from "./contexts/CartContext.jsx";
import { WishlistProvider } from "./contexts/WishlistContext.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import Home from "./page/Home/Home.jsx";
import Contact from "./page/Contact/Contact.jsx";
import Products from "./page/Products/Products.jsx";
import ProductDetail from "./page/Products/ProductDetail.jsx";
import About from "./page/About/About.jsx";
import Auth from "./page/Auth/Auth.jsx";
import AdminDashboard from "./page/Admin/AdminDashboard";
import Cart from "./page/Cart/Cart";
import Orders from "./page/Orders/Orders";
import Wishlist from "./page/Wishlist/Wishlist.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Checkout from "./page/Checkout/Checkout.jsx";
import OrderSuccess from "./page/OrderSuccess/OrderSuccess.jsx";

function AuthPage({ defaultTab }) {
  const navigate = useNavigate();
  const handleLoginSuccess = (data) => {
    const user = data.user;
    const isAdmin = user?.roles?.includes("Admin");
    setTimeout(() => navigate(isAdmin ? "/admin" : "/"), 1500);
  };
  return <Auth defaultTab={defaultTab} onLoginSuccess={handleLoginSuccess} />;
}

function AppInner() {
  const { cartCount, setCartOpen, addItem } = useCart();

  const addToCart = useCallback(async (p) => {
    try { await addItem(p.id, 1); }
    catch (e) { console.error("Thêm vào giỏ thất bại", e); }
  }, [addItem]);

  return (
    <>
      <CartDrawer />
      <Routes>
        <Route element={<MainLayout cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />}>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/san-pham" element={<Products onAddCart={addToCart} />} />
          <Route path="/san-pham/:id" element={<ProductDetail />} />
          <Route path="/gioi-thieu" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderCode" element={<OrderSuccess />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/dang-nhap" element={<AuthPage defaultTab="login" />} />
          <Route path="/dang-ky" element={<AuthPage defaultTab="register" />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <WishlistProvider>
          <AppInner />
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  );
}