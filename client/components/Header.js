"use client"; // Ensure it's a client component
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi"; // Import icons for hamburger menu
import "./Header.css";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          <li>
            <Link href="/cart" onClick={() => setIsOpen(false)}>
              Cart
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={() => setIsOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link href="/login" onClick={() => setIsOpen(false)}>
              Sign Up/Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
