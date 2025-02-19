import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState } from "react";

const LoginModal = ({ isOpen, onClose }) => {
  const { data: session } = useSession();
  const [selectedRole, setSelectedRole] = useState(null);
  const [hasAccount, setHasAccount] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
  
    if (hasAccount) {
      // Handle Sign In (Login)
      try {
        const response = await fetch(`http://localhost:3001/users?email=${formData.email}&password=${formData.password}`);
        const users = await response.json();
  
        if (users.length > 0) {
          console.log("Login successful:", users[0]);
  
          await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });
  
          onClose(); // Close modal on success
        } else {
          setError("Invalid email or password");
        }
      } catch (error) {
        console.error("Login error:", error);
        setError("Something went wrong. Please try again.");
      }
    } else {
      // Handle Sign Up (Register New User)
      try {
        // Check if email is already in use
        const checkUser = await fetch(`http://localhost:3001/users?email=${formData.email}`);
        const existingUsers = await checkUser.json();
  
        if (existingUsers.length > 0) {
          setError("Email is already registered.");
          return;
        }
  
        // Create new user
        const newUser = {
          email: formData.email,
          password: formData.password,
          role: selectedRole, // Save role (client/restaurant)
        };
  
        const response = await fetch("http://localhost:3001/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
  
        if (response.ok) {
          console.log("Signup successful");
  
          // Automatically sign in the user after signup
          await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });
  
          onClose(); // Close modal on success
        } else {
          setError("Signup failed. Try again.");
        }
      } catch (error) {
        console.error("Signup error:", error);
        setError("Something went wrong. Please try again.");
      }
    }
  };
  

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          {/* Close Button */}
          <button className="close-btn" onClick={onClose}>X</button>

          {/* Role Selection */}
          {!selectedRole ? (
            <div className="role-selection">
              <h3 className="text-center font-bold text-lg mb-3">Login as:</h3>
              <button className="client-btn" onClick={() => setSelectedRole("client")}>Client</button>
              <button className="restaurant-btn" onClick={() => setSelectedRole("restaurant")}>Restaurant</button>
            </div>
          ) : (
            <div className="auth-form">
              <h3>{hasAccount ? `Sign In` : `Sign Up`} as {selectedRole}</h3>
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

              {/* Toggle Sign In/Sign Up */}
              <p className="toggle-text">
                {hasAccount ? "Don't have an account? " : "Already have an account? "}
                <span className="toggle-link" onClick={() => setHasAccount(!hasAccount)}>
                  {hasAccount ? "Sign up" : "Sign in"}
                </span>
              </p>
            </div>
          )}

          {/* Sign Out Button (if user is signed in) */}
          {session && (
            <button onClick={signOut} className="signout-btn">
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;