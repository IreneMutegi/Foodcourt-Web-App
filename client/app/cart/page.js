"use client";
import "./page.css";
import { FcEmptyTrash } from "react-icons/fc";
import { useCart } from "../context/CartContext-temp";
import { FaPlus, FaMinus, FaTrash, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

export default function Cart() {
  const { cart, setCart } = useCart();
  const [tableNumber, setTableNumber] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(
          "https://foodcourt-web-app-4.onrender.com/restaurant_tables"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tables");
        }
        const data = await response.json();
        const availableTables = data.tables.filter((table) => table.status.toLowerCase() === "available")
        setTables(availableTables);
      } catch (error) {
        console.error("Error fetching tables", error);
      }
    };
    fetchTables();
  }, []);

  const clientId = session?.user?.id;
  // Ensure only the logged-in client's cart items are shown
  const clientCart = clientId
    ? cart.filter((item) => item.client_id === clientId)
    : [];

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
    clientCart.reduce((sum, item) => sum + item.total, 0).toFixed(2)
  );

  if (!clientId || cart.length === 0) {
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

  const handleOrder = async () => {
    console.log("Selected Table Number:", tableNumber);
    console.log("Available Tables:", tables);
    if (cart.length === 0) {
      console.error("Cart is empty");
      return;
    }
    if (!tableNumber) {
      console.error("Please select a table before proceeding");
      return;
    }

    setIsOrdering(true);
    const table = tables.find((t) => t.table_number === tableNumber);
    if (!table) {
      console.error("Invalid table selected, check tables list", tables);
      return;
    }

    const tableId = table.restaurant_table_id;

    const now = new Date();

    try {
      //First request
      const reservationResponse = await fetch(
        "https://foodcourt-web-app-4.onrender.com/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: Number(session.user.id),
            restaurant_table_id: Number(tableId),
            reservation_date: now.toISOString().split("T")[0], //current date
            reservation_time: now.toLocaleTimeString("en-GB"), //current time
          }),
        }
      );

      if (!reservationResponse.ok) {
        throw new Error("Failed to create reservation");
      }
      const reservationData = await reservationResponse.json();
      console.log(reservationData);
      const reservationId = reservationData.id;

      for (const item of cart) {
        console.log({
          client_id: session.user.id,
          restaurant_id: item.restaurant_id,
          meal_id: item.meal_id,
          quantity: item.quantity,
          reservation_id: reservationId,
        });
        const orderResponse = await fetch(
          "https://foodcourt-web-app-4.onrender.com/orders",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: session.user.id,
              restaurant_id: item.restaurant_id,
              meal_id: item.meal_id,
              quantity: item.quantity,
              reservation_id: reservationId,
            }),
          }
        );
        if (!orderResponse.ok) {
          throw new Error(
            `Failed to place order for meal ${item.meal_id} at restaurant ${item.restaurant_id}`
          );
        }
        console.log(
          `Order placed successfully for meal ${item.meal_id} at ${item.restaurant_id}`
        );
      }
      setCart([]);
      console.log("All orders placed successfully");
    } catch (error) {
      console.error("Error processing orders", error);
    } finally {
      setIsOrdering(false);
    }
  };

  console.log("Current Cart", cart);

  const handleMakeReservation = async (tableNumber, date, time) => {
    const table = tables.find((t) => t.table_number === tableNumber);
    if (!table) return console.error("Invalid table selected");

    const tableId = table.restaurant_table_id;
    const formattedTime = `${time}:00`;
    setIsReserving(true);
    try {
      console.log({
        client_id: Number(session.user.id),
        restaurant_table_id: Number(tableId),
        reservation_date: date,
        reservation_time: formattedTime,
      });
      const reservationResponse = await fetch(
        "https://foodcourt-web-app-4.onrender.com/reservations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: Number(session.user.id),
            restaurant_table_id: Number(tableId),
            reservation_date: date,
            reservation_time: formattedTime,
          }),
        }
      );
      if (!reservationResponse.ok) {
        throw new Error("Failed to create reservation");
      }
      const reservationData = await reservationResponse.json();
      const reservationId = reservationData.id;

      await placeOrders(reservationId);
    } catch (error) {
      console.error("Error processing reservation", error);
    } finally {
      setIsReserving(false);
    }
  };

  const placeOrders = async (reservationId) => {
    try {
      for (const item of cart) {
        console.log({
          client_id: session.user.id,
          restaurant_id: item.restaurant_id,
          meal_id: item.meal_id,
          quantity: item.quantity,
          reservation_id: reservationId,
        });
        const orderResponse = await fetch(
          "https://foodcourt-web-app-4.onrender.com/orders",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: session.user.id,
              restaurant_id: item.restaurant_id,
              meal_id: item.meal_id,
              quantity: item.quantity,
              reservation_id: reservationId,
            }),
          }
        );
        if (!orderResponse.ok) {
          throw new Error(`Failed to place order for ${item.meal_id}`);
        }
        setCart([]);
        console.log("All orders placed successfully");
      }
    } catch (error) {
      console.error("Error processing orders", error);
    }
  };

  if (clientCart.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <FcEmptyTrash size={60} color="#4db6ac" />
          <p>Your Cart is empty</p>
        </div>
      </div>
    );
  }
  return (
    <div className="cart-container">
      <h2>My Cart</h2>
      <div className="cart-items">
        {clientCart.map((item, index) => (
          <div key={index} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-img" />
            <div className="cart-item-info">
              <h3>{item.name}</h3>
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
      {/* Checkout Modal */}
      {showPrompt && (
        <div className="checkout-modal">
          <div className="checkout-modal-content">
            <button
              className="close-btn"
              onClick={() => {
                setShowPrompt(false);
                setSelectedOption(null);
              }}
            >
              <FaTimes />
            </button>
            {!selectedOption && (
              <div className="modal-buttons">
                <button onClick={() => setSelectedOption("order")}>
                  Order Now
                </button>
                <button onClick={() => setSelectedOption("reservation")}>
                  Make Reservation
                </button>
              </div>
            )}
            {selectedOption === "order" && (
              <div className="order-options">
                <label>Select Table Number:</label>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="styled-select"
                  required
                >
                  <option value="">-- Select Table --</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.table_number}>
                      {table.table_number}(Capacity{table.capacity})
                    </option>
                  ))}
                </select>
                <div className="modal-buttons">
                  <button onClick={handleOrder}>
                    {isOrdering ? "Ordering..." : "Make Order"}
                  </button>
                  <button
                    onClick={() => {
                      setShowPrompt(false);
                      setSelectedOption(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {selectedOption === "reservation" && (
              <div className="reservation-options">
                <label>Select Table Number:</label>
                <select
                  className="styled-select"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  required
                >
                  <option value="">-- Select Table --</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.table_number}>
                      {table.table_number}(Capacity{table.capacity})
                    </option>
                  ))}
                </select>
                <label>Select Date:</label>
                <input
                  type="date"
                  className="styled-input"
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  value={selectedDate}
                  required
                />
                {/* prevents past dates */}
                <label>Select Time:</label>
                <input
                  type="time"
                  className="styled-input"
                  onChange={(e) => setSelectedTime(e.target.value)}
                  value={selectedTime}
                  min={
                    new Date().toISOString().split("T")[0] === selectedDate
                      ? new Date().toLocaleTimeString("en-GB").slice(0, 5)
                      : "00:00"
                  }
                  required
                />
                <div className="modal-buttons">
                  <button
                    onClick={() =>
                      handleMakeReservation(
                        selectedTable,
                        selectedDate,
                        selectedTime
                      )
                    }
                    disabled={!selectedTable || !selectedDate || !selectedTime}
                  >
                    {isReserving ? "Reserving.." : "Make Reservation"}
                  </button>
                  <button
                    onClick={() => {
                      setShowPrompt(false);
                      setSelectedOption(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
