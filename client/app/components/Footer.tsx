"use client"; // Ensures it's a client component
import { FiMail, FiInstagram } from "react-icons/fi"; // Email and Instagram icons
import Link from "next/link";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Admin Button */}
        <div className="admin-section">
          <Link href="/admin" className="admin-btn">Admin</Link>
        </div>

        {/* Contacts Section */}
        <div className="contacts">
          <div className="contacts-title">
            <h3>Contact Us</h3>
          </div>
          <div className="contacts-details">
            <p>
              <FiMail />{" "}
              <a href="mailto:nextgen@gmail.com">nextgen@gmail.com</a>
            </p>
            <p>
              <FiInstagram />{" "}
              <a href="https://instagram.com/nextgen" target="_blank" rel="noopener noreferrer">
                @nextgen
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
