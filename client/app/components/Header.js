"use client"; 
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiUser } from "react-icons/fi"; // Import icons for hamburger menu
import LoginModal from "./LoginModal";
import "./Header.css";
import { usePathname } from "next/navigation"; // Import usePathname to get the current route
import { signOut, useSession } from "next-auth/react";

const Header = ({ setIsModalOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Get the current route
  const isRestaurantPage = pathname.startsWith("/restaurant");
  const isAdminPage = pathname.startsWith("/admin"); // Check if it's an admin page
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (session) {
      setShowWelcome(true); // Show welcome when user logs in
      const timer = setTimeout(() => {
        setShowWelcome(false); // Hide welcome after 3 seconds
      }, 3000);

      return () => clearTimeout(timer); // Cleanup timer on re-renders
    }
  }, [session]); // Runs every time session changes

  // Close dropdown when navigating to a different page
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]); // Runs whenever the pathname changes



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
        <li><button onClick={() => logout()} className="logout-btn">Logout</button></li>
         ) : isRestaurantPage ? (
            <>
              <li><Link href="/restaurant" onClick={() => setIsOpen(false)}>Home</Link></li>
              <li><Link href="/orders" onClick={() => setIsOpen(false)}>Orders</Link></li>
            </>
          ) : (
            <>
              <li><Link href="/" onClick={() => setIsOpen(false)}>Home</Link></li>
              <li><Link href="/cart" onClick={() => setIsOpen(false)}>Cart</Link></li>
              <li><Link href="/about" onClick={() => setIsOpen(false)}>About</Link></li>
              <li className="user-dropdown">
                {session ? (
                  <div className="user-container">
                    {/* Name Button to Toggle Dropdown */}
                    <button className="name-btn" onClick={() => setDropdownOpen(!dropdownOpen)}> {showWelcome ? `Welcome ${session.user.name}` : <FiUser size={20} />}</button>
                    {dropdownOpen && (
                      <div className="dropdown-menu">
                        <button onClick={logout}>Logout</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="login-btn" onClick={() => setIsModalOpen(true)} >Login</button>
                )}
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

