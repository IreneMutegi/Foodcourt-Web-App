"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useSession } from "next-auth/react";
import "./ReservationsPopup.css";

const API_BASE_URL = "https://foodcourt-web-app-4.onrender.com";

const statusColors = {
  Pending: "btn-pending",
  Reserved: "btn-reserved",
  Completed: "btn-completed",
  Cancelled: "btn-cancelled",
};

const ReservationsPopup = ({ onClose }) => {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const restaurantId = session?.user?.id;
    console.log("🔹 Restaurant ID:", restaurantId);

    if (!restaurantId) {
      console.error("No restaurant ID found in session.");
      return;
    }

    const fetchReservations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reservations/restaurant/${restaurantId}`);
        const data = await response.json();

        if (!data.reservations) {
          console.error("Invalid API response format:", data);
          return;
        }

        console.log("🔹 Fetched reservations:", data.reservations);

        // Remove duplicate reservations based on reservation_id
        const uniqueReservations = Array.from(
          new Map(data.reservations.map((res) => [res.reservation_id, res])).values()
        );

        setReservations(uniqueReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, [session]);

  const updateReservationStatus = async (reservationId, newStatus) => {
    const restaurantId = session?.user?.id;
    if (!restaurantId) {
      console.error("No restaurant ID found in session.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reservations/restaurant/${restaurantId}/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setReservations((prevReservations) =>
          prevReservations.map((res) =>
            res.reservation_id === reservationId ? { ...res, status: newStatus } : res
          )
        );
      } else {
        console.error("Failed to update reservation status");
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservations-popup-overlay">
      <div className="reservations-popup">
        <button className="close-btn" onClick={onClose}>
          <FiX size={24} />
        </button>
        <h2>Table Reservations</h2>
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Table ID</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
              reservations.map((reservation) => (
                <tr key={reservation.reservation_id}>
                  <td>{reservation.client_name}</td>
                  <td>{reservation.restaurant_table_id}</td>
                  <td>{new Date(reservation.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${statusColors[reservation.status]}`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-dropdown"
                      value={reservation.status}
                      onChange={(e) => updateReservationStatus(reservation.reservation_id, e.target.value)}
                      disabled={loading}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No reservations yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationsPopup;
