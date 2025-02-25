"use client";
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiUser, FiHome, FiShoppingCart, FiInfo } from "react-icons/fi"; // Import icons
import { signOut, useSession } from "next-auth/react";
import "./Header.css";

const Header = ({ setIsModalOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const logout = () => {
    signOut({ callbackUrl: "/" });
    setIsOpen(false);
  };

  return (
    <header className="header">
      <div className="logo">Next Gen</div>

      {/* Hamburger menu button */}
      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
      </button>

      {/* Navigation Menu */}
      <nav className={`nav ${isOpen ? "open" : ""}`}>
        <ul className="navList">
          {/* Icons with Text */}
          <li>
            <Link href="/" onClick={() => setIsOpen(false)} className="nav-item">
              <FiHome size={26} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link href="/cart" onClick={() => setIsOpen(false)} className="nav-item">
              <FiShoppingCart size={26} />
              <span>Cart</span>
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={() => setIsOpen(false)} className="nav-item">
              <FiInfo size={26} />
              <span>About</span>
            </Link>
          </li>

          {/* User Authentication */}
          <li>
            {session ? (
              <button onClick={logout} className="nav-item user-btn">
                <FiUser size={26} />
                <span>Logout</span>
              </button>
            ) : (
              <button className="login-btn" onClick={() => setIsModalOpen(true)}>Login</button>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
