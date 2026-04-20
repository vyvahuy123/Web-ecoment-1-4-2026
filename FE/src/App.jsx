import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import Home from "./page/Home/Home.jsx";
import Contact from "./page/Contact/Contact.jsx";
import Products from "./page/Products/Products.jsx";
import About from "./page/About/About.jsx";
import Auth from "./page/Auth/Auth.jsx";
import AdminDashboard from "./page/Admin/AdminDashboard";
import Cart from "./page/Cart/Cart";
import Orders from "./page/Orders/Orders";
import CartDrawer from "./components/CartDrawer.jsx";
import CartService from "./services/cart.service.js";

function AuthPage({ defaultTab }) {
  const navigate = useNavigate();
  const handleLoginSuccess = (data) => {
    const user = data.user;
    const isAdmin = user?.roles?.includes("Admin");
    setTimeout(() => navigate(isAdmin ? "/admin" : "/"), 1500);
  };
  return <Auth defaultTab={defaultTab} onLoginSuccess={handleLoginSuccess} />;
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const handleCartCountChange = useCallback((count) => setCartCount(count), []);
  const addToCart = useCallback(async (product) => {
  try {
    await CartService.addItem({ productId: product.id, quantity: 1 });
    setCartCount((c) => c + 1);
  } catch (err) {
    console.error("Thêm vào giỏ thất bại", err);
  }
}, []);

  return (
    <BrowserRouter>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCartCountChange={handleCartCountChange} />
      <Routes>
        <Route element={<MainLayout cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />}>
          <Route path="/" element={<Home />} />
          <Route path="/lien-he" element={<Contact />} />
          <Route path="/san-pham" element={<Products onAddCart={addToCart} />} />
          <Route path="/gioi-thieu" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/dang-nhap" element={<AuthPage defaultTab="login" />} />
          <Route path="/dang-ky" element={<AuthPage defaultTab="register" />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}