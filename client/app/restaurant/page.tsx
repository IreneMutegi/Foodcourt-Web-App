"use client";
import { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/menu"; // Change to your Flask backend URL

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dishData, setDishData] = useState({
    name: "",
    cuisine: "",
    category: "",
    price: "",
    image: "",
  });
  const [dishes, setDishes] = useState([]);

  // Fetch menu from the backend
  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setDishes(data))
      .catch((error) => console.error("Error fetching dishes:", error));
  }, []);

  // Handle form submission (Add or Edit Dish)
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editIndex !== null) {
      // Update dish
      const updatedDish = { ...dishData };
      await fetch(`${API_URL}/${dishes[editIndex].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDish),
      });
      const updatedDishes = [...dishes];
      updatedDishes[editIndex] = updatedDish;
      setDishes(updatedDishes);
      setEditIndex(null);
    } else {
      // Add new dish
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dishData),
      });
      const newDish = await response.json();
      setDishes([...dishes, newDish]);
    }

    setDishData({ name: "", cuisine: "", category: "", price: "", image: "" });
    setShowForm(false);
  };

  // Open edit form with dish details
  const handleEdit = (index: number) => {
    setDishData(dishes[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  // Delete a dish
  const handleDelete = async (index: number) => {
    const dishId = dishes[index].id;
    await fetch(`${API_URL}/${dishId}`, { method: "DELETE" });

    const updatedDishes = dishes.filter((_, i) => i !== index);
    setDishes(updatedDishes);
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setDishData({ ...dishData, image: data.imageUrl });
    }
  };

  return (
    <div className="dashboard">
      <div className="menu-header">
        <h2 className="menu-title">Menu</h2>
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
              <tr key={index}>
                <td>
                  <img src={dish.image} alt={dish.name} className="dish-image" />
                </td>
                <td>{dish.name}</td>
                <td>{dish.category}</td>
                <td>{dish.price}</td>
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

      {/* Add/Edit Dish Form */}
      {showForm && (
        <div className="dish-form-overlay">
          <div className="dish-form-container">
            <h3>{editIndex !== null ? "Edit Dish" : "Add Dish"}</h3>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Dish Name"
                required
                value={dishData.name}
                onChange={(e) => setDishData({ ...dishData, name: e.target.value })}
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                required
                value={dishData.category}
                onChange={(e) => setDishData({ ...dishData, category: e.target.value })}
              />
              <input
                type="text"
                name="price"
                placeholder="Price"
                required
                value={dishData.price}
                onChange={(e) => setDishData({ ...dishData, price: e.target.value })}
              />
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {dishData.image && <img src={dishData.image} alt="Preview" className="image-preview" />}

              <div className="form-buttons">
                <button type="submit">{editIndex !== null ? "Update Dish" : "Add Dish"}</button>
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
