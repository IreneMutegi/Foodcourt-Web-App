"use client";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import "./TablesPopup.css";

const API_BASE_URL = "https://foodcourt-web-app-4.onrender.com";

const statusColors = {
  Available: "btn-available",
  Occupied: "btn-occupied",
  occupied: "btn-occupied", // Ensure lowercase 'occupied' is handled
};

const TablesPopup = ({ onClose }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all restaurant tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/restaurant_tables`);
        const data = await response.json();

        if (!data.tables || !Array.isArray(data.tables)) {
          console.error("Invalid API response format:", data);
          return;
        }

        setTables(data.tables); // Use the correct "tables" key from API response
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();
  }, []);

  // Update table status
  const updateTableStatus = async (tableId, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/restaurant_tables/${tableId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTables((prevTables) =>
          prevTables.map((table) =>
            table.restaurant_table_id === tableId ? { ...table, status: newStatus } : table
          )
        );
      } else {
        console.error("Failed to update table status");
      }
    } catch (error) {
      console.error("Error updating table:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tables-popup-overlay">
      <div className="tables-popup">
        <button className="close-btn" onClick={onClose}>
          <FiX size={24} />
        </button>
        <h2>All Restaurant Tables</h2>
        <table className="tables-table">
          <thead>
            <tr>
              <th>Table Number</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.length > 0 ? (
              tables.map((table) => (
                <tr key={table.restaurant_table_id}>
                  <td>{table.table_number}</td>
                  <td>{table.capacity}</td>
                  <td>
                    <span className={`status-badge ${statusColors[table.status] || "btn-available"}`}>
                      {table.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-dropdown"
                      value={table.status}
                      onChange={(e) => updateTableStatus(table.restaurant_table_id, e.target.value)}
                      disabled={loading}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No tables found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablesPopup;
