"use client"; // Enables client-side interactivity
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiEdit, FiTrash2 } from "react-icons/fi"; // Icons
import "./Dashboard.css";

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dishData, setDishData] = useState({ name: "", cuisine: "", category: "", price: "", image: "" });
  const [dishes, setDishes] = useState([
    { name: "Pasta", cuisine: "Italian", category: "Main Course", price: "500 KES", image: "https://via.placeholder.com/100" }
  ]);

  // Handle form submission (Add or Edit Dish)
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editIndex !== null) {
      const updatedDishes = [...dishes];
      updatedDishes[editIndex] = dishData;
      setDishes(updatedDishes);
      setEditIndex(null);
    } else {
      setDishes([...dishes, dishData]);
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
  const handleDelete = (index: number) => {
    const updatedDishes = dishes.filter((_, i) => i !== index);
    setDishes(updatedDishes);
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setDishData({ ...dishData, image: imageUrl });
    }
  };

  return (
    <div className="dashboard">
      {/* Menu Title & Add Dish Button */}
      <div className="menu-header">
        <h2 className="menu-title">Menu</h2>
        <button className="add-dish-btn" onClick={() => setShowForm(true)}>+ Add Dish</button>
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
                <td><img src={dish.image} alt={dish.name} className="dish-image" /></td>
                <td>{dish.name}</td>
               
                <td>{dish.category}</td>
                <td>{dish.price}</td>
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

      {/* Dish Cards */}
      {/*<div className="dish-cards">
        {dishes.map((dish, index) => (
          <div className="dish-card" key={index}>
            <img src={dish.image} alt={dish.name} className="dish-card-image" />
            <p><strong>Name:</strong> {dish.name}</p>
            <p><strong>Cuisine:</strong> {dish.cuisine}</p>
            <p><strong>Category:</strong> {dish.category}</p>
            <p><strong>Price:</strong> {dish.price}</p>
            <div className="card-actions">
              <button className="edit-btn" onClick={() => handleEdit(index)}>
                <FiEdit /><span>Edit</span>
              </button>
              <button className="delete-btn" onClick={() => handleDelete(index)}>
                <FiTrash2 /><span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>*/}

      {/* Add/Edit Dish Form */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleFormSubmit}>
            <input type="text" name="name" placeholder="Dish Name" required value={dishData.name} onChange={(e) => setDishData({ ...dishData, name: e.target.value })} />
            
            <input type="text" name="category" placeholder="Category" required value={dishData.category} onChange={(e) => setDishData({ ...dishData, category: e.target.value })} />
            <input type="text" name="price" placeholder="Price" required value={dishData.price} onChange={(e) => setDishData({ ...dishData, price: e.target.value })} />
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {dishData.image && <img src={dishData.image} alt="Preview" className="image-preview" />}
            <button type="submit">{editIndex !== null ? "Update Dish" : "Add Dish"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditIndex(null); }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
