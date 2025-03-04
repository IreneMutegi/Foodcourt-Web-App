"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiUser, FiHome, FiShoppingCart, FiShoppingBag, FiInfo} from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import OrdersPopup from "./ordersPopup";
import { FiCalendar } from "react-icons/fi";
import ReservationsPopup from "./reservationsPopup";
import { FiCalendar } from "react-icons/fi";
import "./Header.css";

const Header = ({ setIsModalOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isRestaurantPage = pathname.startsWith("/restaurant");
  const isAdminPage = pathname.startsWith("/admin");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [showReservationsPopup, setShowReservationsPopup] = useState(false);

  useEffect(() => {
    if (session) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const logout = () => {
    signOut({ callbackUrl: "/" });
    setIsOpen(false);
  };

  // <Link href={`/orders/${session?.user?.id}`}>My Orders</Link>


  return (
    <header className="header">
      <div className="logo">Next Gen</div>

      <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
      </button>

      <nav className={`nav ${isOpen ? "open" : ""}`}>
        <ul className="navList">
          {isAdminPage ? (
            <li><button onClick={logout} className="nav-item logout-btn">Logout</button></li>
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
                  { <FiShoppingCart size={26} /> }
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
              <li><button onClick={logout} className="nav-item logout-btn">Logout</button></li>
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
                <Link href="/about" onClick={() => setIsOpen(false)} className="nav-item">
                  <FiInfo size={26} />
                  <span>About</span>
                </Link>
              </li>
              <li className="user-dropdown">
                {session ? (
                  <div className="user-container">
                    <button className="name-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                      {showWelcome ? `Welcome ${session.user.name}` : <FiUser size={20} />}
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
    </header>
  );
};

export default Header;
