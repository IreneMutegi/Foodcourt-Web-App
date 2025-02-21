"use client"; // Ensure this is at the top
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import { CartProvider } from "./context/CartContext";

export default function RootLayout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <CartProvider>
            <Header setIsModalOpen={setIsModalOpen} />
            <LoginModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
            {children}
            <Footer setIsModalOpen={setIsModalOpen} />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
