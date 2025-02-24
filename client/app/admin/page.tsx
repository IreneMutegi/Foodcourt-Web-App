"use client";
import { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "./AdminDashboard.css";

const API_URL = "https://foodcourt-web-app-4.onrender.com/restaurants"; // Backend API

interface RestaurantType {
  id?: number;
  name: string;
  cuisine: string;
  email: string;
  password: string;
  image_url: string;
  admin_id: number;
}

const AdminDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [restaurantData, setRestaurantData] = useState<RestaurantType>({
    name: "",
    cuisine: "",
    email: "",
    password: "",
    image_url: "",
    admin_id: 1, // Set a default admin_id (change if needed)
  });
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);

  // Fetch Restaurants from Backend
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  // Handle Edit
  const handleEdit = (index: number) => {
    setEditIndex(index);
    const restaurant = restaurants[index];
    setRestaurantData({ ...restaurant, image_url: restaurant.image_url || "" });
    setShowForm(true);
  };

  // Handle Delete
  const handleDelete = async (index: number) => {
    const restaurantId = restaurants[index]?.id;
    if (!restaurantId) {
      console.error("Error: Missing restaurant ID for delete.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${restaurantId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete restaurant.");
        return;
      }

      setRestaurants(restaurants.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    }
  };

  // Handle Form Submission (Add or Edit Restaurant)
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (editIndex !== null) {
        // UPDATE Restaurant
        const restaurantId = restaurants[editIndex]?.id;
        if (!restaurantId) {
          console.error("Error: Missing restaurant ID for update.");
          return;
        }

        const response = await fetch(`${API_URL}/${restaurantId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(restaurantData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to update restaurant:", errorText);
          return;
        }

        const updatedRestaurants = [...restaurants];
        updatedRestaurants[editIndex] = { ...restaurantData, id: restaurantId };
        setRestaurants(updatedRestaurants);
        setEditIndex(null);
      } else {
        // ADD Restaurant
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(restaurantData),
        });

        if (!response.ok) {
          console.error("Failed to add restaurant.");
          return;
        }

        const newRestaurant = await response.json();
        setRestaurants([...restaurants, newRestaurant]);
      }

      // Reset Form
      setRestaurantData({ name: "", cuisine: "", email: "", password: "", image_url: "", admin_id: 1 });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving restaurant:", error);
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="menu-header">
        <h2 className="menu-title">Restaurants</h2>
        <button className="add-restaurant-btn" onClick={() => setShowForm(true)}>
          + Add Restaurant
        </button>
      </div>

      {/* Restaurants Table */}
      <div className="table-container">
        <table className="restaurant-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Cuisine</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant, index) => (
              <tr key={restaurant.id ?? index}>
                <td>
                  <img
                    src={restaurant.image_url || "default-image-url.jpg"}
                    alt={restaurant.name}
                    className="restaurant-image"
                  />
                </td>
                <td>{restaurant.name}</td>
                <td>{restaurant.cuisine}</td>
                <td className="actions">
                  <button className="edit-btn" onClick={() => handleEdit(index)}>
                    <FiEdit />
                    <span>Edit</span>
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(index)}>
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Restaurant Form */}
      {showForm && (
        <div className="restaurant-form-overlay">
          <div className="restaurant-form-container">
            <h3>{editIndex !== null ? "Edit Restaurant" : "Add Restaurant"}</h3>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Restaurant Name"
                required
                value={restaurantData.name}
                onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
              />

              <input
                type="text"
                name="cuisine"
                placeholder="Cuisine"
                required
                value={restaurantData.cuisine}
                onChange={(e) => setRestaurantData({ ...restaurantData, cuisine: e.target.value })}
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={restaurantData.email}
                onChange={(e) => setRestaurantData({ ...restaurantData, email: e.target.value })}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={restaurantData.password}
                onChange={(e) => setRestaurantData({ ...restaurantData, password: e.target.value })}
              />

              {/* Image URL Input */}
              <input
                type="text"
                name="image_url"
                placeholder="Insert Image URL"
                value={restaurantData.image_url}
                onChange={(e) => setRestaurantData({ ...restaurantData, image_url: e.target.value })}
              />

              {restaurantData.image_url && (
                <img src={restaurantData.image_url} alt="Preview" className="image-preview" />
              )}

              {/* Hidden Admin ID Field */}
              <input type="hidden" name="admin_id" value={restaurantData.admin_id} />

              <div className="form-buttons">
                <button type="submit">{editIndex !== null ? "Update Restaurant" : "Add Restaurant"}</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
