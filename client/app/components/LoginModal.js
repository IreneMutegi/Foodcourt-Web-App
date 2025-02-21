"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./LoginModal.css";

const LoginModal = ({ isOpen, onClose, isAdminLogin = false }) => {
  const { data: session } = useSession();
  const [selectedRole, setSelectedRole] = useState(null);
  const [hasAccount, setHasAccount] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  
  React.useEffect(() => {
    if (isOpen) {
      setSelectedRole((prevRole) => prevRole || (isAdminLogin ? "admin" : null));
    }

  }, [isOpen, isAdminLogin]);

  if (!isOpen) return null;

  // Handles both Sign-In & Sign-Up
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    console.log("Form submitted", selectedRole);

    const tables = [selectedRole, ...["admin", "client", "restaurant"].filter(role => role !== selectedRole)];
    let user = null;
    let userRole = null;

    try {
      // For Sign-In
      if (hasAccount) {
        // Check each table for the user
        for (const table of tables) {
          const response = await fetch(`http://localhost:5555/${table}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formData.email, password: formData.password }),
          });
    
          if (response.ok) {
            const data = await response.json();
            user = data.user;
            userRole = table;
            break; // Stop checking after first successful login
          }
        }
    
        if (!user) {
          setError("User not found. Please sign up.");
          return;
        }    

        // if (user.password !== formData.password) {
        //   setError("Invalid email or password.");
        //   return;
        // }

        if (userRole !== selectedRole) {
          setError(`You are registered as a ${userRole}.`);
          return;
        }

        // Sign in with NextAuth
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          role: userRole,
          redirect: false,
        });

        if (result.error) {
          setError("Invalid email or password.");
        } else {
          setSuccessMessage("You've successfully signed in!");
          setTimeout(() => {
            setSuccessMessage("");
            onClose();
            redirectUser(userRole);
          },2000);
        }
        
      } 
       // For Sign-Up
       else {
        // Check if the email already exists in any table
        for (const table of tables) {
          const response = await fetch(`http://localhost:5555/${selectedRole}/signup?email=${formData.email}`);
          const existingUsers = await response.json();
          if (existingUsers.length > 0) {
            setError("Email is already registered.");
            return;
          }
        }

        // Add new user to the selected role table
        const newUser = {
          name: formData.name,
          email: formData.email,
          password: formData.password, // Should be hashed in the backend
          role: selectedRole,
        };

        const response = await fetch(`http://localhost:5555/${selectedRole}/signup`, {
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
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };


  // Redirect user based on role
  const redirectUser = (role) => {
    if (role === "restaurant") {
      router.push("/restaurant");
    } else if (role === "client") {
      router.push("/");
    } else if (role === "admin") {
      router.push("/admin");
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
  <input
    type="text"
    placeholder="Full Name"
    className="form-input"
    value={formData.name}  // Ensure this is bound to state
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}  // Update state
    required
  />
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