"use client"; // Ensure it's a client component
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname to get the current route
import { FiMenu, FiX } from "react-icons/fi"; // Import icons for hamburger menu
import "./Header.css";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Get the current route

  // Check if the user is on the restaurants page
  const isRestaurantPage = pathname.startsWith("/restaurant");

  return (
    <header className="header">
      <div className="logo">Next Gen</div>

      {/* Hamburger menu button for mobile */}
      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Navigation Links */}
      <nav className={isOpen ? "nav open" : "nav"}>
        <ul className="navList">
          {isRestaurantPage ? (
            <>
              <li><Link href="/home" onClick={() => setIsOpen(false)}>Home</Link></li>
              <li><Link href="/orders" onClick={() => setIsOpen(false)}>Orders</Link></li>
              <li><Link href="/logout" onClick={() => setIsOpen(false)}>Logout</Link></li>
            </>
          ) : (
            <>
              <li><Link href="/cart" onClick={() => setIsOpen(false)}>Cart</Link></li>
              <li><Link href="/about" onClick={() => setIsOpen(false)}>About</Link></li>
              <li><Link href="/login" onClick={() => setIsOpen(false)}>Sign Up/Login</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
