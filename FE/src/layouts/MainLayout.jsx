import { Outlet } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import Navbar from "../page/Navbar/Navbar.jsx";
import Footer from "../page/Footer/Footer.jsx";

export default function MainLayout({ cartCount, onCartOpen }) {
  return (
    <>
      <Navbar cartCount={cartCount} onCartOpen={onCartOpen} />
      <Outlet />
      <Footer />
    </>
  );
}