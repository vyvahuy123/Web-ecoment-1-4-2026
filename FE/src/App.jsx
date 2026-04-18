import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
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

// Wrapper để dùng useNavigate trong Auth
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
  const [cartItems, setCartItems] = useState([]);
  const totalCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.name === product.name);
      if (exists) return prev.map((i) => i.name === product.name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout cartCount={totalCount} onCartOpen={() => setCartOpen(true)} />}>
          <Route path="/" element={<Home cartOpen={cartOpen} setCartOpen={setCartOpen} cartItems={cartItems} setCartItems={setCartItems} />} />
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