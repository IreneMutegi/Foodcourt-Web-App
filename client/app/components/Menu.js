import { useCart } from "../context/CartContext-temp";
import "./Menu.css";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Menu({ restaurant, onClose, meals, addToCart }) {
  const [addedItems, setAddedItems] = useState([]);
  const { cart, setCart } = useCart();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { data: session, status } = useSession();

  console.log(meals);
  const handleCartToggle = (item) => {
    if (!session) {
      setShowLoginPrompt(true);
      return;
    }
    if (addedItems.includes(item.name)) {
      setAddedItems(addedItems.filter((name) => name !== item.name));
      setCart(cart.filter((cartItem) => cartItem.meal !== item.name));
    } else {
      setAddedItems([...addedItems, item.name]);
      setCart([
        ...cart,
        {
          meal_id: item.id,
          client_id: session.user.id,
          restaurant_id: restaurant.id,
          price: item.price,
          quantity: 1,
          total: item.price,
          image: item.image_url,
          name: item.name,
        },
      ]);
    }
  };

  return (
    <div className="menu-overlay">
      <div className="menu-container">
        <button onClick={onClose} id="close-btn">
          X
        </button>
        <div className="menu-header">
          {restaurant.image_url && (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="restaurant-image"
            />
          )}
          <h2>{restaurant.name}</h2>
        </div>
        <h3>Menu</h3>
        <div className="menu-grid">
          {meals.length > 0 ? (
            meals.map((item, index) => (
              <div key={index} className="menu-item">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="menu-image"
                />
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
      {showLoginPrompt && (
        <div className="login-prompt-overlay">
          <div className="login-prompt">
            <div className="prompt-content">
              <p>Please log in to add items to the cart.</p>
              <button onClick={() => setShowLoginPrompt(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
