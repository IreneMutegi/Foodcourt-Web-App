"use client";
import "./page.css";
import { FcEmptyTrash } from "react-icons/fc";
import { useCart } from "../context/CartContext-temp";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { useState } from "react";

export default function Cart() {
  const { cart, setCart } = useCart();
  const [tableNumber, setTableNumber] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateCartItem = (index, field, value) => {
    setCart((prevCart) =>
      prevCart.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
              total:
                item.price * (field === "quantity" ? value : item.quantity),
            }
          : item
      )
    );
  };

  const totalAmount = parseFloat(
    cart.reduce((sum, item) => sum + item.total, 0).toFixed(2)
  );

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <FcEmptyTrash size={60} color="#4db6ac" />
          <p>Your Cart is empty</p>
        </div>
      </div>
    );
  }

  const removeCartItem = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  // const handleCheckout = async () => {
  //   if (!tableNumber.trim()) {
  //     alert("Please enter a valid table number");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     for (const item of cart) {
  //       const orderData = {
  //         ...item,
  //         table_number: tableNumber,
  //       };

  //       const response = await fetch(
  //         "https://foodcourt-web-app-4.onrender.com/orders",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(orderData),
  //         }
  //       );
  //       console.log(cart)

  //       if (!response.ok) {
  //         throw new Error(`Failed to place order for ${item.meal}`);
  //       }
  //     }

  //     alert("Order placed successfully");
  //     setCart([]);
  //     setShowPrompt(false);
  //     setTableNumber("");
  //   } catch (error) {
  //     console.error("Error submitting order:", error);
  //     alert("Something went wrong, please try again");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCheckout = async () => {
    if (!tableNumber.trim()) {
      alert("Please enter a valid table number");
      return;
    }
  
    setLoading(true);
  
    try {
      const orderRequests = cart.map(async (item) => {
        const orderData = {
          meal_id: item.meal_id,  // Ensure backend expects `meal_id`, not `id`
          client_id: item.client_id,
          restaurant_id: item.restaurant_id,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
          table_number: tableNumber, // Add table number here before submitting
        };
  
        const response = await fetch(
          "https://foodcourt-web-app-4.onrender.com/orders",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
          }
        );
  
        if (!response.ok) {
          throw new Error(`Failed to place order for ${item.meal}`);
        }
      });
  
      // Wait for all orders to be processed before proceeding
      await Promise.all(orderRequests);
  
      alert("Order placed successfully");
      setCart([]); // Clear cart after successful checkout
      setShowPrompt(false);
      setTableNumber("");
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };
  

  console.log("Current Cart", cart);
  return (
    <div className="cart-container">
      <h2>My Cart</h2>
      <div className="cart-items">
        {cart.map((item, index) => (
          <div className="cart-item" key={index}>
            <img src={item.image} alt={item.meal} className="cart-item-img" />
            <div className="cart-item-info">
              <h3>{item.meal}</h3>
              <p className="item-price">${item.total.toFixed(2)}</p>
              <div className="quantity-controls">
                <button
                  onClick={() =>
                    updateCartItem(
                      index,
                      "quantity",
                      Math.max(1, item.quantity - 1)
                    )
                  }
                >
                  <FaMinus />
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    updateCartItem(index, "quantity", item.quantity + 1)
                  }
                >
                  <FaPlus />
                </button>
              </div>
              <button
                className="delete-btn"
                onClick={() => removeCartItem(index)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Item Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <button className="checkout-btn" onClick={() => setShowPrompt(true)}>
          Proceed to Checkout
        </button>
      </div>
      {/* Table Number Input Modal */}
      {showPrompt && (
        <div className="checkout-modal">
          <div className="checkout-modal-content">
            <h3>Enter Table Number</h3>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Enter table number"
            />
            <div className="modal-buttons">
              <button onClick={handleCheckout} disabled={loading}>
                {loading ? "Processing..." : "Confirm Order"}
              </button>
              <button onClick={() => setShowPrompt(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
