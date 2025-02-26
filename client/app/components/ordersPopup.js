"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import "./OrdersPopup.css";

const API_BASE_URL = "https://foodcourt-web-app-4.onrender.com";

const OrdersPopup = ({ onClose }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        const data = await response.json();
        setOrders(
          (data.orders || []).map((order) => ({
            ...order,
            status: "Pending", // Initialize all orders as pending
          }))
        );
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderStatus = async (index) => {
    const updatedStatus = orders[index].status === "Pending" ? "Done" : "Pending";

    // Update the local state
    setOrders((prevOrders) =>
      prevOrders.map((order, i) =>
        i === index
          ? { ...order, status: updatedStatus }
          : order
      )
    );

    // Update the order status in the backend
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orders[index].id}`, {
        method: "PATCH", // or "PUT" based on your API design
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: updatedStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className="orders-popup-overlay">
      <div className="orders-popup">
        <button className="close-btn" onClick={onClose}>
          <FiX size={24} />
        </button>
        <h2>Current Orders</h2>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Table</th>
              <th>Client</th>
              <th>Meal</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Action</th> {/* This column is for the button */}
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <tr key={index}>
                  <td>{order.table_number}</td>
                  <td>{order.client_name}</td>
                  <td>{order.meal_name}</td>
                  <td>{order.quantity}</td>
                  <td>{order.status}</td>
                  <td>
                    <button
                      className={`status-btn ${order.status.toLowerCase()}`}
                      onClick={() => toggleOrderStatus(index)}
                    >
                      {order.status === "Pending" ? "Mark as Done" : "Mark as Pending"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No orders yet.</td> {/* Adjusted to span across 6 columns */}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPopup;
