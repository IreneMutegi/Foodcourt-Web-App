import { useCart } from "../context/CartContext-temp";
import "./Menu.css";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Menu({ restaurant, onClose, meals, addToCart }) {
  const [addedItems, setAddedItems] = useState([]);
  const { cart, setCart } = useCart();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { data: session, status } = useSession();

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
        <h2>{restaurant.name} - Menu</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {meals.length > 0 ? (
              meals.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>{item.category}</td>
                  <td>
                    <button
                      id="order-btn"
                      onClick={() => handleCartToggle(item)}
                    >
                      {addedItems.includes(item.name)
                        ? "Remove"
                        : "Add to Cart"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No meals available</td>
              </tr>
            )}
          </tbody>
        </table>
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
