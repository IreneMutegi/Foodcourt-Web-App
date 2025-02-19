"use client"; 
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiEdit, FiTrash2 } from "react-icons/fi";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [restaurantData, setRestaurantData] = useState({ name: "", cuisine: "", email: "", password: "" });
  const [restaurants, setRestaurants] = useState([
    { name: "Italian Bistro", cuisine: "Italian", email: "bistro@example.com", password: "password123" }
  ]);

  // Handle form submission (Add or Edit Restaurant)
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editIndex !== null) {
      const updatedRestaurants = [...restaurants];
      updatedRestaurants[editIndex] = restaurantData;
      setRestaurants(updatedRestaurants);
      setEditIndex(null);
    } else {
      setRestaurants([...restaurants, restaurantData]);
    }
    setRestaurantData({ name: "", cuisine: "", email: "", password: "" });
    setShowForm(false);
  };

  // Open edit form with restaurant details
  const handleEdit = (index: number) => {
    setRestaurantData(restaurants[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  // Delete a restaurant
  const handleDelete = (index: number) => {
    const updatedRestaurants = restaurants.filter((_, i) => i !== index);
    setRestaurants(updatedRestaurants);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="menu-header">
        <h2 className="menu-title">Restaurants</h2>
        <button className="add-restaurant-btn" onClick={() => setShowForm(true)}>+ Add Restaurant</button>
      </div>

      {/* Restaurants Table */}
      <div className="table-container">
        <table className="restaurant-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Cuisine</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant, index) => (
              <tr key={index}>
                <td>{restaurant.name}</td>
                <td>{restaurant.cuisine}</td>
                <td className="actions">
                  <button className="edit-btn" onClick={() => handleEdit(index)}>
                    <FiEdit /><span>Edit</span>
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(index)}>
                    <FiTrash2 /><span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Restaurant Form */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleFormSubmit}>
            <input type="text" name="name" placeholder="Restaurant Name" required value={restaurantData.name} onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })} />
            <input type="text" name="cuisine" placeholder="Cuisine" required value={restaurantData.cuisine} onChange={(e) => setRestaurantData({ ...restaurantData, cuisine: e.target.value })} />
            <input type="email" name="email" placeholder="Email" required value={restaurantData.email} onChange={(e) => setRestaurantData({ ...restaurantData, email: e.target.value })} />
            <input type="password" name="password" placeholder="Password" required value={restaurantData.password} onChange={(e) => setRestaurantData({ ...restaurantData, password: e.target.value })} />
            <button type="submit">{editIndex !== null ? "Update Restaurant" : "Add Restaurant"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditIndex(null); }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
