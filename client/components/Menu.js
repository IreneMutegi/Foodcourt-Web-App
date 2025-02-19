import "./Menu.css";
import { useState } from "react";
export default function Menu({ restaurant, onClose }) {
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
    setOrderDetails({ ...orderDetails, [e.target.name]: [e.target.value] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Order submitted:", {
      item: selectedItem,
      ...orderDetails,
    });

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
              <label>
                Quantity:
                <input
                  type="number"
                  name="quantity"
                  value={orderDetails.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </label>

              <label>
                Table Number:
                <input
                  type="text"
                  name="tableNumber"
                  value={orderDetails.tableNumber}
                  onChange={handleChange}
                  required
                />
              </label>

              <div className="form-buttons">
                <button type="submit">Submit Order</button>
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
