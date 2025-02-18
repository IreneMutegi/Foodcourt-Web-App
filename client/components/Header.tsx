"use client"; // Ensure it's a client component
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi"; // Import icons for hamburger menu
import LoginModal from "./LoginModal";
import "./Header.css";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <li><Link href="/cart" onClick={() => setIsOpen(false)}>Cart</Link></li>
          <li><Link href="/about" onClick={() => setIsOpen(false)}>About</Link></li>
          <li>
            {/* Open the Login Modal */}
            <button className="login-btn" onClick={() => setIsModalOpen(true)}>
              Login
            </button>
          </li>
        </ul>
      </nav>
       {/* Login Selection Modal */}
       <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Header;
