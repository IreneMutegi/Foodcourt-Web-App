"use client"; 
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi"; // Import icons for hamburger menu
import LoginModal from "./LoginModal";
import "./Header.css";
import { usePathname } from "next/navigation"; // Import usePathname to get the current route
import { signOut } from "next-auth/react";

const Header = ({ setIsModalOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Get the current route
  const isRestaurantPage = pathname.startsWith("/restaurant");
  const isAdminPage = pathname.startsWith("/admin"); // Check if it's an admin page
  const logout =()=>{
    signOut({callbackUrl:"/"})
    setIsOpen(false)
  }
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
          {isAdminPage ? (
            <li><Link  onClick={() => logout()}>Logout</Link></li>
          ) : isRestaurantPage ? (
            <>
              <li><Link href="/restaurant" onClick={() => setIsOpen(false)}>Home</Link></li>
              <li><Link href="/orders" onClick={() => setIsOpen(false)}>Orders</Link></li>
              <li><Link href="/logout" onClick={() => setIsOpen(false)}>Logout</Link></li>
            </>
          ) : (
            <>
              <li><Link href="/" onClick={() => setIsOpen(false)}>Home</Link></li>
              <li><Link href="/cart" onClick={() => setIsOpen(false)}>Cart</Link></li>
              <li><Link href="/about" onClick={() => setIsOpen(false)}>About</Link></li>
              <li>
                {/* Open the Login Modal */}
                <button className="login-btn" onClick={() => setIsModalOpen(true)}>
                  Login
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
