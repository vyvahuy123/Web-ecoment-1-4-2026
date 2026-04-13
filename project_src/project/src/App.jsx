import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./page/Home/Home.jsx";
import Contact from "./page/Contact/Contact.jsx";
import Navbar from "./page/Navbar/Navbar.jsx";
import Footer from "./page/Footer/Footer.jsx";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const totalCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <BrowserRouter>
      <Navbar cartCount={totalCount} onCartOpen={() => setCartOpen(true)} />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              cartOpen={cartOpen}
              setCartOpen={setCartOpen}
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          }
        />
        <Route path="/lien-he" element={<Contact />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
