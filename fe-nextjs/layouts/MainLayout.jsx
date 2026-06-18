"use client";
import Link from "next/link";
import ChatWidget from '../components/ChatWidget.jsx';
import { useWishlist } from '@/contexts/WishlistContext';
import Navbar from '../page/Navbar/Navbar.jsx';
import Footer from '../page/Footer/Footer.jsx';

export default function MainLayout({ children, cartCount, onCartOpen }) {
  return (
    <>
      <Navbar cartCount={cartCount} onCartOpen={onCartOpen} />
      {children}
      <Footer />
      <ChatWidget />
    </>
  );
}
