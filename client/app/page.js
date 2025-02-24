"use client";
import Menu from "./components/Menu";
import { useState, useEffect } from "react";
import { useCart } from "./context/CartContext-temp";
import "./page.css";
import { fetchData } from "next-auth/client/_utils";

export default function Home() {
  const baseUrl = "https://foodcourt-web-app-4.onrender.com";
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { cart, setCart } = useCart();
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantMeals, setRestaurantMeals] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const loadSvg = "/loading.svg";

  const addToCart = (order) => {
    console.log("Adding order", order);
    setCart((prevCart) => [...prevCart, order]);
  };

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.category &&
        restaurant.category.toLowerCase().includes(searchTerm.toLowerCase)) ||
      (restaurant.cuisine &&
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/restaurants`);
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setRestaurants(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (!selectedRestaurant) return;
    const fetchMeals = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/menu/restaurant/${selectedRestaurant.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch meals");
        const data = await response.json();
        console.log("fetched meals data", data);
        setRestaurantMeals(data.meals);
      } catch (error) {
        console.error("Error fetching meals:", error.message);
      }
    };
    fetchMeals();
  }, [selectedRestaurant]);
  return (
    <>
      <section>
        <div className="search-form-container">
          <h3>RESTAURANTS</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="search (cuisine/name/category)"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
        {loading ? (
          <div className="loading-container" alt="Loading...">
            <img src={loadSvg} />
          </div>
        ) : (
          <div className="restaurant-card-container">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((restaurant, index) => (
                <div
                  className="restaurant-card"
                  key={index}
                  onClick={() => setSelectedRestaurant(restaurant)}
                >
                  <div className="image-container">
                    <img src={restaurant.image_url} alt={restaurant.name} />
                  </div>
                  <p>{restaurant.name}</p>
                </div>
              ))
            ) : (
              <p> No results found</p>
            )}
          </div>
        )}
        {selectedRestaurant && (
          <Menu
            restaurant={selectedRestaurant}
            meals={restaurantMeals}
            onClose={() => setSelectedRestaurant(null)}
            addToCart={addToCart}
          />
        )}
      </section>
    </>
  );
}
