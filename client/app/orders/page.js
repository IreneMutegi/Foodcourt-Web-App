"use client";
import { useState, useEffect } from "react";
import { FaStar, FaTrash } from "react-icons/fa";
import { MdOutlineShoppingBag } from "react-icons/md";
import "./orders.css";
import { useSession } from "next-auth/react";

export default function OrdersHistory() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [ratings, setRatings] = useState({}); 

  const clientId = session?.user?.id;
   // Ensure only the logged-in client's orders are shown
  const clientOrders = clientId ? orders.filter((item) => item.client_id === clientId) : [];

  useEffect(() => {
    if (!clientId) return;
    fetch(`https://foodcourt-web-app-4.onrender.com/orders/${clientId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders); // Extract orders array from the response object
        } else {
          console.error("Unexpected data format:", data);
          setOrders([]); // Fallback to an empty array
        }
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setOrders([]); // Handle errors by setting an empty array
      });
  }, [clientId]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredOrders = orders
  .sort((a, b) => b.order_id - a.order_id) // Sort by order_id, newest first
  .slice(0, 5) // Take only the latest 5 orders
  .filter(
    (order) =>
      order.restaurant_name.toLowerCase().includes(search.toLowerCase()) ||
      order.meal_name.toLowerCase().includes(search.toLowerCase()) ||
      order.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleRating = (orderId, rating) => {
    setRatings((prev) => ({ ...prev, [orderId]: rating }));
  };


  if (!clientId || clientOrders.length === 0) {
    return (
      <div className="container">
        <div className="empty-bag">
          <MdOutlineShoppingBag size={60} color="#4db6ac" />
          <p>You have no Orders</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="container">
      <h2>Your Orders</h2>
      <input
        type="text"
        placeholder="Search by restaurant, meal, or category"
        value={search}
        onChange={handleSearch}
        className="searchBox"
      />
      <div className="ordersList">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div key={order.order_id} className="orderCard"> 
              <img
                src={order.image_url}
                alt={order.meal_name}
                className="orderImage"
              />
              <div className="orderInfo">
                <h3>{order.meal_name}</h3>
                <p>From: {order.restaurant_name}</p>
                <p>Category: {order.category}</p>
                <p>Quantity: {order.quantity}</p>
                <p>Total Price: ${order.total}</p>
                <p className="orderStatus">Status:{" "}
                  <span className={`statusText ${order.status.toLowerCase()}`}>{order.status}</span>
                 </p>
                 {order.status.toLowerCase() === "confirmed" && (
                <p className="orderMessage confirmed">Your order will be served in 20 mins</p>
                  )}
                <div className="rating">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <FaStar
                        key={index}
                        className="star"
                        color={
                          ratingValue <= (ratings[order.order_id] || 0)
                            ? "#ffc107"
                            : "#e4e5e9"
                        }
                        onClick={() => handleRating(order.order_id, ratingValue)}
                      />
                    );
                  })}
                </div>
                <p className="orderNumber">Order #{order.order_id}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="emptyOrders">Your order list is empty</p>
        )}
      </div>
    </div>
  );
}