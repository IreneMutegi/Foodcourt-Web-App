"use client"; // Enables client-side interactivity
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiEdit, FiTrash2 } from "react-icons/fi"; // Icons
import "./Dashboard.css";

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null); // Track editing index
  const [dishData, setDishData] = useState({ name: "", cuisine: "", category: "", price: "" });
  const [dishes, setDishes] = useState([
    { name: "Pasta", cuisine: "Italian", category: "Main Course", price: "500 KES" }
  ]);

  // Handle form submission (Add or Edit Dish)
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editIndex !== null) {
      // Update dish details
      const updatedDishes = [...dishes];
      updatedDishes[editIndex] = dishData;
      setDishes(updatedDishes);
      setEditIndex(null);
    } else {
      // Add new dish
      setDishes([...dishes, dishData]);
    }
    setDishData({ name: "", cuisine: "", category: "", price: "" });
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

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">NextGen</div>
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link href="/home">Home</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/logout">Logout</Link>
        </nav>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </header>

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
              <th>Name</th>
              <th>Cuisine</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => (
              <tr key={index}>
                <td>{dish.name}</td>
                <td>{dish.cuisine}</td>
                <td>{dish.category}</td>
                <td>{dish.price}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(index)}><FiEdit /></button>
                  <button className="delete-btn" onClick={() => handleDelete(index)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dish Cards */}
      <div className="dish-cards">
        {dishes.map((dish, index) => (
          <div className="dish-card" key={index}>
            <p><strong>Name:</strong> {dish.name}</p>
            <p><strong>Cuisine:</strong> {dish.cuisine}</p>
            <p><strong>Category:</strong> {dish.category}</p>
            <p><strong>Price:</strong> {dish.price}</p>
            <div className="card-actions">
              <button className="edit-btn" onClick={() => handleEdit(index)}><FiEdit /></button>
              <button className="delete-btn" onClick={() => handleDelete(index)}><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dish Form */}
      {showForm && (
        <div className="form-container">
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
              name="cuisine" 
              placeholder="Cuisine Type" 
              required 
              value={dishData.cuisine} 
              onChange={(e) => setDishData({ ...dishData, cuisine: e.target.value })}
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
            <button type="submit">{editIndex !== null ? "Update Dish" : "Add Dish"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditIndex(null); }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
