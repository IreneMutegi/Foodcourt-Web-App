"use client";
import "./page.css";
import { useState } from "react";

export default function Cart({ cart = [], setCart }) {
  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalAmount = (cart || []).reduce((sum, item) => sum + item.total, 0);
  if (cart.length === 0){
    return (<div className="cart-container">
        <p>No Meals In Cart</p>
    </div>)
  }
  return (
    <div className="cart-container">
      <h2>Cart</h2>
      <table>
        <thead>
          <tr>
            <th>Meal</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index}>
              <td>{item.meal}</td>
              <td>{item.price}</td>
              <td>{item.quantity}</td>
              <td>{item.total}</td>
              <td>
                <button id="remove-btn" onClick={() => removeItem(index)}>
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="checkout-section">
        <h3>
          Total: <span>{totalAmount}</span>
        </h3>
        <button id="make-order-btn" type="submit">
          Make order
        </button>
      </div>
    </div>
  );
}
