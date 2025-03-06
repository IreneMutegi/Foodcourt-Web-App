"use client"
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import "./reservation.css";
import { MdEventBusy } from "react-icons/md";

export default function Reservations() {
  const { data: session } = useSession();
  const [reservation, setReservation] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  

  const clientId = session?.user?.id;


  useEffect(() => {
    if (!clientId) return;
    const fetchReservations = () => {
        fetch(`https://foodcourt-web-app-4.onrender.com/reservations/client/${clientId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.reservations.length > 0) {
              const latestReservation = data.reservations
                .filter(res => res.status !== "canceled") // Exclude canceled ones
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
              setReservation(latestReservation);
            } else {
              setReservation(null);
            }
          });
      };
    
      fetchReservations();
    
      // Optional: Polling every 10 seconds to check for new reservations
      const interval = setInterval(fetchReservations, 10000);
    
      return () => clearInterval(interval); // Cleanup on unmount
    }, [clientId, reservation]);

  // Show popup when cancel is clicked
  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const handleCancel = async () => {

    await fetch(`https://foodcourt-web-app-4.onrender.com/reservations/client/${clientId}/${reservation.reservation_id}`, {
      method: 'PATCH',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "canceled" }),
    });
    // Fetch latest reservation after cancellation
  fetch(`https://foodcourt-web-app-4.onrender.com/reservations/client/${clientId}`)
  .then((res) => res.json())
  .then((data) => {
    if (data.reservations.length > 0) {
      const latestReservation = data.reservations
        .filter(res => res.status !== "canceled") // Exclude canceled ones
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      setReservation(latestReservation);
    } else {
      setReservation(null);
    }
  });

setShowPopup(false);
};

  if (!clientId || !reservation) {
    return (
      <div className="reservations-container">
        <div className="empty-reservations">
          <MdEventBusy size={60} color="#4db6ac" />
          <p>No reservations made.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="reservations-container">
      <h2 className="heading">Your Reservation</h2>
          <div className="reservation-card">
            <div className="reservation-details">
              <p><strong>Reservation NO:</strong> # {reservation.reservation_id}</p>
              <p><strong>Table NO:</strong> {reservation.table_number}</p>
              <p><strong>Date:</strong> {reservation.date}</p>
              <p><strong>Time:</strong> {reservation.time}</p>
              <p className="reservationStatus">
           <strong>Status:</strong>{" "}
        <span className={`statusText ${reservation?.status?.toLowerCase() || ""}`}>
          {reservation.status}
        </span>
      </p>
        </div>
        {reservation.status === "Reserved" && (
              <button onClick={() => handleShowPopup(reservation)} className="cancel-button">
                Cancel Reservation
              </button>
                )}
          </div>

       {/* Custom Centered Popup */}
       {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Cancel Reservation</h3>
            <p>Are you sure you want to cancel this reservation?</p>
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={handleCancel}>Yes, Cancel</button>
              <button className="cancel-btn" onClick={() => setShowPopup(false)}>No, Keep It</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
