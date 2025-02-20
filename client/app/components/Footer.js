"use client"; // Ensures it's a client component
import { FiMail, FiInstagram } from "react-icons/fi"; // Email and Instagram icons
import Link from "next/link";
import { useState } from "react";
import LoginModal from "./LoginModal";
import "./Footer.css";

const Footer = ({ setIsModalOpen }) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Admin Button */}
        <div className="admin-section">
          <button className="admin-btn" onClick={() => setIsAdminOpen(true)}>Admin</button>
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
      {isAdminOpen && <LoginModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} isAdminLogin />}
    </footer>
  );
};

export default Footer;
