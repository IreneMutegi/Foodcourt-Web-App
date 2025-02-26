"use client";
import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("cart")) || []
      : []
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Loading cart from localStorage");
      const savedCart = JSON.parse(localStorage.getItem("cart"));
      if (savedCart) setCart(savedCart);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Saving cart to localStorage:", cart);
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
