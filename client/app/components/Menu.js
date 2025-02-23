import "./Menu.css";
import { useState } from "react";
export default function Menu({ restaurant, onClose, addToCart }) {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderDetails, setOrderDetails] = useState({
    quantity: "",
    tableNumber: "",
  });

  const handleOrderClick = (item) => {
    setSelectedItem(item);
    setShowOrderForm(true);
  };

  const handleChange = (e) => {
    setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const order = {
      meal: selectedItem.name,
      price: selectedItem.price,
      quantity: parseInt(orderDetails.quantity, 10),
      total: selectedItem.price * parseInt(orderDetails.quantity),
      tableNumber: orderDetails.tableNumber,
    };

    addToCart(order);
    alert("Meal added to cart");

    setShowOrderForm(false);
    setOrderDetails({ quantity: "", tableNumber: "" });
  };

  return (
    <div className="menu-overlay">
      <div className="menu-container">
        <button onClick={onClose} id="close-btn">
          X
        </button>
        <h2>{restaurant.name} - Menu</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {restaurant.menu.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.category}</td>
                <td>
                  <button id="order-btn" onClick={() => handleOrderClick(item)}>
                    Order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* OrderForm PopUp */}
      {showOrderForm && (
        <div className="order-form-overlay">
          <div className="order-form-container">
            <h3>Order: {selectedItem.name}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="number"
                name="quantity"
                value={orderDetails.quantity}
                onChange={handleChange}
                min="1"
                placeholder="Quantity"
                required
              />

              <input
                type="number"
                name="tableNumber"
                value={orderDetails.tableNumber}
                onChange={handleChange}
                min="1"
                placeholder="Table Number"
                required
              />

              <div className="form-buttons">
                <button type="submit">Add Meal</button>
                <button type="button" onClick={() => setShowOrderForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
