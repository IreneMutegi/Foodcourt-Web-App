"use client"; // Ensures it's a client component
import { FiPhone, FiMapPin } from "react-icons/fi"; // Phone and Location icons
import Link from "next/link";
import { useState } from "react";
import LoginModal from "./LoginModal";
import "./Footer.css";

const Footer = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <footer className="footer">
      <div className="footer-content">
        
        {/* Admin Section */}
        <div className="footer-section admin-section">
          <button className="admin-btn" onClick={() => setIsAdminOpen(true)}>Admin</button>
        </div>

        {/* About Section */}
        <div className="footer-section">
          <h3>About Next Gen</h3>
          <p>Welcome to Next Gen, your go-to destination for delicious food! We bring together the best restaurants to serve you top-quality meals, delivered fresh to your doorstep.</p>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/restaurants">Restaurants</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section">
          <h3>Contact</h3>
          <p><FiPhone /> +254 734 719 052</p>
          <p><FiMapPin /> Mombasa Road, Nairobi</p>
        </div>
        
      </div>

      {/* Admin Login Modal */}
      {isAdminOpen && <LoginModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} isAdminLogin />}
      
    </footer>
  );
};

export default Footer;
