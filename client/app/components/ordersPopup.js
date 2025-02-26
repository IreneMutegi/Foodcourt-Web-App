"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // ✅ Import useSession
import { FiX } from "react-icons/fi";
import "./OrdersPopup.css";

const API_BASE_URL = "https://foodcourt-web-app-4.onrender.com";

const OrdersPopup = ({ onClose }) => {
  const { data: session } = useSession(); // ✅ Get session
  const restaurantId = session?.user?.id; // ✅ Extract restaurant ID

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!restaurantId) return; // Ensure restaurant ID is available

      try {
        const response = await fetch(`${API_BASE_URL}/orders/restaurants/${restaurantId}`);
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [restaurantId]);

  return (
    <div className="orders-popup-overlay">
      <div className="orders-popup">
        <button className="close-btn" onClick={onClose}>
          <FiX size={24} />
        </button>
        <h2>Current Orders</h2>

        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Table</th>
                <th>Meal</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.table_number}</td>
                    <td>{order.meal_name}</td>
                    <td>{order.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrdersPopup;
