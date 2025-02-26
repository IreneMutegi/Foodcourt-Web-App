"use client";
import "./page.css";
import { FcEmptyTrash } from "react-icons/fc";
import { useCart } from "../context/CartContext-temp";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";

export default function Cart() {
  const { cart, setCart } = useCart();

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
      <div className="empty-cart">
        <FcEmptyTrash size={60} color="#4db6ac" />
        <p>Your Cart is empty</p>
      </div>
    );
  }

  const removeCartItem = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };
  
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
                    updateCartItem(index, "quantity", Math.max(1, item.quantity - 1))
                  }
                >
                  <FaMinus />
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateCartItem(index, "quantity", item.quantity + 1)}
                >
                  <FaPlus />
                </button>
              </div>
              <button className="delete-btn" onClick={() => removeCartItem(index)}>
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
          <span>${(totalAmount).toFixed(2)}</span>
        </div>
        <button className="checkout-btn">Proceed to Checkout</button>
      </div>
    </div>
  );
}
