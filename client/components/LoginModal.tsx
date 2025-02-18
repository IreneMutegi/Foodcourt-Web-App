"use client";
import React, { useState } from "react";
import "./LoginModal.css";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [hasAccount, setHasAccount] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"client" | "restaurant" | null>(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>

        {/* Show role selection first */}
        {!selectedRole ? (
          <>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: "10px" }}>Login as:</h3>
            <button className="client-btn" onClick={() => setSelectedRole("client")}>
              Client
            </button>
            <button className="restaurant-btn" onClick={() => setSelectedRole("restaurant")}>
              Restaurant
            </button>
          </>
        ) : selectedRole === "client" ? (
          <>
            <h3>{hasAccount ? "Client Sign In" : "Client Sign Up"}</h3>
            <form>
              {/* Show Full Name only if signing up */}
              {!hasAccount && (
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full p-2 border rounded mb-2" 
                  required 
                />
              )}
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full p-2 border rounded mb-2" 
                required 
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full p-2 border rounded mb-2" 
                required 
              />
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                {hasAccount ? "Sign In" : "Sign Up"}
              </button>
            </form>

            {/* Toggle between Sign In and Sign Up */}
            <p className="text-base mt-2 text-black" style={{ color: "black", display: "block" }}>
  {hasAccount ? "Don't have an account? " : "Already have an account? "}
  <span 
    className="text-blue-500 cursor-pointer"
    onClick={() => setHasAccount((prev) => !prev)}
  >
    {hasAccount ? "Sign up" : "Sign in"}
  </span>
</p>


          </>
        ) : (
          <h3>Restaurant Login (To be implemented)</h3>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
