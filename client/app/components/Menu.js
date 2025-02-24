import { useCart } from "../context/CartContext";
import "./Menu.css";
import { useState } from "react";
export default function Menu({ restaurant, onClose, meals, addToCart }) {
  const [addedItems, setAddedItems] = useState([]);
  const { cart, setCart } = useCart();

  const handleCartToggle = (item) => {
    if (addedItems.includes(item.name)) {
      setAddedItems(addedItems.filter((name) => name !== item.name));
      setCart(cart.filter((cartItem) => cartItem.meal !== item.name))
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
    </div>
  );
}
