"use client";
import "./page.css";
import { FcEmptyTrash } from "react-icons/fc";
import { useCart } from "../context/CartContext-temp";

export default function Cart() {
  const { cart, setCart } = useCart();
  console.log("cart in Cart page", cart);

  const removeItem = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

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
        <div>
          <FcEmptyTrash size={60} color="#4db6ac" />
          <p>Your Cart is empty</p>
        </div>
      </div>
    );
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
            <th>Table Number</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index}>
              <td>{item.meal}</td>
              <td>{item.price}</td>
              <td>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    updateCartItem(
                      index,
                      "quantity",
                      parseInt(e.target.value) || 1
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Table Number"
                  value={item.tableNumber}
                  onChange={(e) =>
                    updateCartItem(index, "tableNumber", e.target.value)
                  }
                />
              </td>
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
