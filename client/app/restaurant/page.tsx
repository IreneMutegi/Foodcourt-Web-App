"use client";
import { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "./Dashboard.css";

const API_BASE_URL = "https://foodcourt-web-app-4.onrender.com";
const RESTAURANT_ID = 1; // Replace this with the authenticated restaurant's ID

// Define TypeScript interfaces
interface Dish {
  id?: number;
  name: string;
  category: string;
  price: number;
  image_url: string;
  restaurant_id?: number;
}

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dishData, setDishData] = useState<Dish>({
    name: "",
    category: "",
    price: 0,
    image_url: "",
  });

  // Fetch restaurant menu
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/menu/restaurant/${RESTAURANT_ID}`);
        const data = await response.json();
        if (data.meals) {
          setDishes(data.meals);
        }
      } catch (error) {
        console.error("Error fetching dishes:", error);
      }
    };
    fetchMenu();
  }, []);

  // Handle form submission (Add or Edit Dish)
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newDish = { ...dishData, restaurant_id: RESTAURANT_ID };

    if (editIndex !== null) {
      // Update dish
      const dishId = dishes[editIndex]?.id;
      if (!dishId) return;

      try {
        await fetch(`${API_BASE_URL}/meals/${dishId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDish),
        });

        const updatedDishes = [...dishes];
        updatedDishes[editIndex] = { ...newDish, id: dishId };
        setDishes(updatedDishes);
      } catch (error) {
        console.error("Error updating dish:", error);
      }

      setEditIndex(null);
    } else {
      // Add new dish
      try {
        const response = await fetch(`${API_BASE_URL}/meals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDish),
        });
        const addedDish = await response.json();
        setDishes([...dishes, { ...addedDish, id: addedDish.id || Date.now() }]);
      } catch (error) {
        console.error("Error adding dish:", error);
      }
    }

    setDishData({ name: "", category: "", price: 0, image_url: "" });
    setShowForm(false);
  };

  // Open edit form with selected dish details
  const handleEdit = (index: number) => {
    setDishData(dishes[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  // Delete a dish
  const handleDelete = async (index: number) => {
    const dishId = dishes[index]?.id;
    if (!dishId) return;

    try {
      await fetch(`${API_BASE_URL}/meals/${dishId}`, { method: "DELETE" });
      setDishes(dishes.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting dish:", error);
    }
  };

  return (
    <div className="dashboard">
      <div className="menu-header">
        <h2 className="menu-title">Restaurant Menu</h2>
        <button className="add-dish-btn" onClick={() => setShowForm(true)}>
          + Add Dish
        </button>
      </div>

      {/* Dish Table */}
      <div className="table-container">
        <table className="dish-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => (
              <tr key={dish.id || index}>
                <td>
                  <img
                    src={dish.image_url || "https://via.placeholder.com/80"}
                    alt={dish.name}
                    className="dish-image"
                  />
                </td>
                <td>{dish.name}</td>
                <td>{dish.category}</td>
                <td>${dish.price}</td>
                <td className="actions">
                  <button className="edit-btn" onClick={() => handleEdit(index)}>
                    <FiEdit />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(index)}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dish Form */}
      {showForm && (
        <div className="dish-form-overlay">
          <div className="dish-form-container">
            <h3>{editIndex !== null ? "Edit Dish" : "Add Dish"}</h3>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                placeholder="Dish Name"
                required
                value={dishData.name}
                onChange={(e) => setDishData({ ...dishData, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Category"
                required
                value={dishData.category}
                onChange={(e) => setDishData({ ...dishData, category: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price"
                required
                value={dishData.price}
                onChange={(e) =>
                  setDishData({ ...dishData, price: parseFloat(e.target.value) || 0 })
                }
              />
              <input
                type="text"
                placeholder="Image URL"
                required
                value={dishData.image_url}
                onChange={(e) => setDishData({ ...dishData, image_url: e.target.value })}
              />
              <div className="form-buttons">
                <button type="submit">{editIndex !== null ? "Update" : "Add"}</button>
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
