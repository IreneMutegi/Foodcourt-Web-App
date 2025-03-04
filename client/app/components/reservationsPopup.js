"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import "./ReservationsPopup.css";

const API_BASE_URL = "https://foodcourt-web-app-4.onrender.com";

const ReservationsPopup = ({ onClose }) => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reservations`);
        const data = await response.json();
        setReservations(data.reservations || []);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);

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
              <th>Table</th>
              <th>Client</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
              reservations.map((reservation, index) => (
                <tr key={index}>
                  <td>{reservation.table_number}</td>
                  <td>{reservation.client_name}</td>
                  <td>{new Date(reservation.reservation_datetime).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No reservations yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationsPopup;
