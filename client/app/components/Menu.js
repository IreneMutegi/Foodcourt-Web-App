import { useCart } from "../context/CartContext-temp";
import "./Menu.css";
import { useState } from "react";

export default function Menu({ restaurant, onClose, meals, addToCart }) {
  const [addedItems, setAddedItems] = useState([]);
  const { cart, setCart } = useCart();

  const handleCartToggle = (item) => {
    if (addedItems.includes(item.name)) {
      setAddedItems(addedItems.filter((name) => name !== item.name));
      setCart(cart.filter((cartItem) => cartItem.meal !== item.name));
    } else {
      setAddedItems([...addedItems, item.name]);
      setCart([
        ...cart,
        {
          meal: item.name,
          price: item.price,
          quantity: 1,
          tableNumber: "",
          total: item.price,
        },
      ]);
    }
  };

  return (
    <div className="menu-overlay">
      <div className="menu-container">
        <button onClick={onClose} id="close-btn">X</button>
        <div className="menu-header">
          {restaurant.image_url && (
             <img src={restaurant.image_url} alt={restaurant.name} className="restaurant-image" />)}
          <h2>{restaurant.name}</h2>
        </div>
        <h3>Menu</h3>
        <div className="menu-grid">
          {meals.length > 0 ? (
            meals.map((item, index) => (
              <div key={index} className="menu-item">
                <img src={item.image} alt={item.name} className="menu-image" />
                <h4>{item.name}</h4>
                <p className="price">${item.price.toFixed(2)}</p>
                <p className="category">{item.category}</p>
                <button
                  className="order-btn"
                  onClick={() => handleCartToggle(item)}
                >
                  {addedItems.includes(item.name) ? "Remove" : "Add to Cart"}
                </button>
              </div>
            ))
          ) : (
            <p>No meals available</p>
          )}
        </div>
      </div>
    </div>
  );
}
