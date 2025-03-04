"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; 
import { FiX } from "react-icons/fi";
import "./OrdersPopup.css";

const API_BASE_URL = "https://foodcourt-web-app-4.onrender.com";

const OrdersPopup = ({ onClose }) => {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const statusOptions = ["Pending", "Confirmed", "Completed", "Cancelled"];

  useEffect(() => {
    if (status === "loading") return;

    const restaurantId = session?.user?.id;
    if (!restaurantId) {
      console.error("No restaurant ID found in session.");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/restaurants/${restaurantId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        console.log("Orders received:", data);

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, status]);

  // ✅ Function to handle status update
  const handleStatusChange = async (orderId, newStatus) => {
    const restaurantId = session?.user?.id; 

    console.log("🔹 restaurantId:", restaurantId);
console.log("🔹 orderId:", orderId);
console.log("🔹 Updating status to:", newStatus);

    if (!restaurantId) {
      console.error("🚨 No restaurant ID found in session.");
      return;
    }
  
    const url = `${API_BASE_URL}/orders/restaurants/${restaurantId}/order/${orderId}`;
    console.log("🔹 PATCH request to:", url);
    console.log("🔹 Request body:", JSON.stringify({ status: newStatus }));
  
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      console.log("🔹 Response status:", response.status);
      const responseData = await response.json();
      console.log("🔹 Response data:", responseData);
  
      if (!response.ok) {
        throw new Error(`Failed to update: ${responseData.message || response.statusText}`);
      }
  
      // ✅ Update UI after successful patch
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
  
      console.log(`✅ Order ${orderId} updated to ${newStatus}`);
    } catch (error) {
      console.error("🚨 Error updating order status:", error.message);
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
              <th>Actions</th>  {/* ✅ Added Actions Column */}
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.table_number || "N/A"}</td>
                  <td>{order.client_name}</td>
                  <td>{order.meal_name}</td>
                  <td>{order.quantity}</td>
                  <td className={`status ${order.status.toLowerCase()}`}>{order.status}</td>
                  <td>
                    {/* ✅ Dropdown for selecting a new status */}
                    <select
                      className="actions-dropdown"
                      onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                      value={order.status}
                    >
                      {statusOptions.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No orders yet.</td> 
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPopup;
