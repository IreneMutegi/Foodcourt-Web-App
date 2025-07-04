"use client";
import Menu from "./components/Menu";
import { useState, useEffect, useRef } from "react";
import { useCart } from "./context/CartContext-temp";
import "./page.css";

import sliderImages from "../public/images";

export default function Home() {
  const baseUrl = "https://foodcourt-web-app-4.onrender.com";
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { setCart } = useCart();
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantMeals, setRestaurantMeals] = useState([]);
  const [setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
 
  const targetSectionRef = useRef(null);

  const loadSvg = "/loading.svg";
  const imagesPerSlide = 3;

  const addToCart = (order) => {
    console.log("Adding order", order);
    setCart((prevCart) => [...prevCart, order]);
  };

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.category &&
        restaurant.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex + imagesPerSlide >= sliderImages.length
          ? 0
          : prevIndex + imagesPerSlide
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // const handleReservationBtn = () => {
  //   if (!session) {
  //     alert("Please login to make a reservation");
  //   }
  //   if (cart === 0) {
  //     alert(
  //       "Your cart is empty, add items to cart so as to make a reservation"
  //     );
  //   }
  // };

  const handleOrderNowBtn = () => {
    targetSectionRef.current?.scrollIntoView({ behaviour: "smooth" });
  };
  return (
    <>
      <section>
        <div className="hero-section">
          <div className="hero-details">
            <div className="hero-left">
              <h2>Discover Amazing Restaurants</h2>
              <p>Find and order from restaurants within with ease </p>
              <div className="welcome-btns">
                {/* <button onClick={() => handleReservationBtn()}>
                  Book a reservation
                </button> */}
                <button onClick={() => handleOrderNowBtn()}>Order Now</button>
              </div>
            </div>
            <div className="hero-right">
              <img src="/images/hero-image.png" alt="Hero Image" />
            </div>
          </div>
          <div className="image-slider">
            <div
              className="slider-wrapper"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / imagesPerSlide)
                }%)`,
              }}
            >
              {sliderImages.map((image, index) => (
                <img key={index} src={image} alt={`Slide ${index + 1}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="search-form-container">
          <h3>OUR RESTAURANTS</h3>

          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="search (cuisine/name/category)"
              onChange={(e) => setSearchTerm(e.target.value)}
              id="search-restaurant"
            />
          </form>
        </div>
        {loading ? (
          <div className="loading-container" alt="Loading...">
            <img src={loadSvg} />
          </div>
        ) : (
          <div className="restaurant-card-container" ref={targetSectionRef}>
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

                  <div className="restaurant-details">
                    <h2>{restaurant.name}</h2>
                    <p>{restaurant.cuisine}</p>
                  </div>
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
