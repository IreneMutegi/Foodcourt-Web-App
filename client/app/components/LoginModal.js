"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import "./LoginModal.css";

const LoginModal = ({ isOpen, onClose, isAdminLogin = false }) => {
  const { data: session } = useSession();
  const [selectedRole, setSelectedRole] = useState(null);
  const [hasAccount, setHasAccount] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      if (isAdminLogin) {
        setSelectedRole("admin"); // Directly set to "admin" for admin login
      } else {
        setSelectedRole(null); // Ensure the modal starts from role selection for other users
      }
    }
  }, [isOpen, isAdminLogin]);
  

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
  
    if (hasAccount) {
      // Fetch user details from the backend to verify role before signing in
      try {
        const response = await fetch(`http://localhost:3001/users?email=${formData.email}`);
        const users = await response.json();
  
        if (users.length === 0) {
          setError("User not found. Please sign up.");
          return;
        }
  
        const user = users[0]; // Assuming unique emails (adjust if necessary)
  
        if (user.password !== formData.password) {
          setError("Invalid email or password.");
          return;
        }
  
        if (user.role !== selectedRole) {
          setError(`You are registered as a ${user.role}.`);
          return;
        }
  
        // Proceed with NextAuth sign-in if role matches
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
  
        if (result.error) {
          setError("Invalid email or password.");
        } else {
          setSuccessMessage("You've successfully signed in!");
          setTimeout(() => {
            setSuccessMessage("");
            onClose();
          }, 2000);
        }
      } catch (error) {
        setError("Something went wrong. Please try again.");
      }
    } else {
      // Handle Sign Up
      try {
        const checkUser = await fetch(`http://localhost:3001/users?email=${formData.email}`);
        const existingUsers = await checkUser.json();
  
        if (existingUsers.length > 0) {
          setError("Email is already registered.");
          return;
        }
  
        const newUser = {
          email: formData.email,
          password: formData.password, // This should be hashed in the backend
          role: selectedRole,
        };
  
        const response = await fetch("http://localhost:3001/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
  
        if (response.ok) {
          setSuccessMessage("You've successfully signed up!");
          setTimeout(() => {
            setSuccessMessage("");
            setHasAccount(true);
          }, 2000);
        } else {
          setError("Signup failed. Try again.");
        }
      } catch (error) {
        setError("Something went wrong. Please try again.");
      }
    }
  };  

  return (
    <>
      {/* Modal for Role Selection */}
      {!selectedRole && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              {/* Close Button */}
              <button className="close-btn" onClick={onClose}>X</button>
  
              {/* Role Selection */}
              <div className="role-selection">
                <h3 className="text-center font-bold text-lg mb-3">Login as:</h3>
                <button className="client-btn" onClick={() => setSelectedRole("client")}>
                  Client
                </button>
                <button className="restaurant-btn" onClick={() => setSelectedRole("restaurant")}>
                  Restaurant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
  
      {/* Authentication Form Appears as a Modal */}
      {selectedRole && (
        <div className="auth-form-container-overlay">
          <div className="auth-form-container">
            <button className="close-btn" onClick={onClose}>X</button>
            <h3 className="text-white">{hasAccount ? `Sign In` : `Sign Up`} as {selectedRole}</h3>
            {successMessage && <p className="success-text">{successMessage}</p>}
            <form onSubmit={handleAuth} className="flex flex-col items-center w-full">
              {/* Full Name Field (only for Sign Up) */}
              {!hasAccount && (
                <input type="text" placeholder="Full Name" className="form-input" required />
              )}
  
              <input
                type="email"
                placeholder="Email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
  
              <input
                type="password"
                placeholder="Password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
  
              {error && <p className="error-text">{error}</p>}
  
              <button type="submit" className="submit-btn">
                {hasAccount ? "Sign In" : "Sign Up"}
              </button>
            </form>
  
            {/* Toggle Sign In/Sign Up - Only for Clients */}
            {selectedRole === "client" && (
              <p className="toggle-text">
                {hasAccount ? "Don't have an account? " : "Already have an account? "}
                <span className="toggle-link" onClick={() => setHasAccount(!hasAccount)}>
                  {hasAccount ? "Sign up" : "Sign in"}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoginModal;