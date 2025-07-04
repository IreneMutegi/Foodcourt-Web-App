"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiUser, FiHome, FiShoppingCart, FiShoppingBag, FiInfo, FiCalendar, FiTable } from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import OrdersPopup from "./ordersPopup";
import ReservationsPopup from "./reservationsPopup";
import TablesPopup from "./tablesPopup"; // Import TablesPopup component
import "./Header.css";

const Header = ({ setIsModalOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isRestaurantPage = pathname.startsWith("/restaurant");
  const isAdminPage = pathname.startsWith("/admin");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [showReservationsPopup, setShowReservationsPopup] = useState(false);
  const [showTablesPopup, setShowTablesPopup] = useState(false); // New state for TablesPopup

  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const logout = () => {
    signOut({ callbackUrl: "/" });
    setIsOpen(false);
  };

  return (
    <header className="header">
      <div className="logo">Next Gen</div>

      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
      </button>

      <nav className={`nav ${isOpen ? "open" : ""}`}>
        <ul className="navList">
          {isAdminPage ? (
            <>
              <li>
                <button 
                  onClick={() => setShowTablesPopup(true)} 
                  className="nav-item tables-btn"
                >
                  <FiTable size={26} />
                  <span>Tables</span>
                </button>
              </li>
              <li>
                <button onClick={logout} className="nav-item logout-btn">Logout</button>
              </li>
            </>
          ) : isRestaurantPage ? (
            <>
              <li>
                <Link href="/restaurant" onClick={() => setIsOpen(false)} className="nav-item">
                  <FiHome size={26} />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setShowOrdersPopup(true)}
                  className="nav-item orders-btn"
                >
                  <FiShoppingCart size={26} />
                  <span>Orders</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowReservationsPopup(true)}
                  className="nav-item reservations-btn"
                >
                  <FiCalendar size={26} />
                  <span>Reservations</span>
                </button>
              </li>
              <li>
                <button onClick={logout} className="nav-item logout-btn">Logout</button>
              </li>
            </>
          ) : (
            <>
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
                <Link href="/orders" onClick={() => setIsOpen(false)} className="nav-item">
                  <FiShoppingBag size={26} />
                  <span>My Orders</span>
                </Link>
              </li>
              <li>
                <Link href="/reservation" onClick={() => setIsOpen(false)} className="nav-item">
                  <FiCalendar size={26} />
                  <span> My Reservation</span>
                </Link>
              </li>
              <li>
                <Link href="/about" onClick={() => setIsOpen(false)} className="nav-item">
                  <FiInfo size={26} />
                  <span>About</span>
                </Link>
              </li>
              <li className="user-dropdown">
                {session ? (
                  <div className="user-container">
                 <button className="name-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                   <FiUser size={21} />
                  <span className="user-name">
                    {session.user.name.split(" ")[0].charAt(0).toUpperCase() + session.user.name.split(" ")[0].slice(1)}
                  </span>
                 </button>
                    {dropdownOpen && (
                      <div className="dropdown-menu">
                        <button onClick={logout}>Logout</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="login-btn" onClick={() => setIsModalOpen(true)}>Login</button>
                )}
              </li>
            </>
          )}
        </ul>
      </nav>

      {showOrdersPopup && <OrdersPopup onClose={() => setShowOrdersPopup(false)} />}
      {showReservationsPopup && <ReservationsPopup onClose={() => setShowReservationsPopup(false)} />}
      {showTablesPopup && <TablesPopup onClose={() => setShowTablesPopup(false)} />} {/* New Tables Popup */}
    </header>
  );
};

export default Header;
