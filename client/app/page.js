"use client";
import restaurants from "../public/data";
import Menu from "./components/Menu";
import { useState } from "react";
import "./page.css";
export default function Home() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  return (
    <>
      <section>
        <div className="search-form-container">
          <h3>RESTAURANTS</h3>
          <form>
            <input type="text" placeholder="search (cuisine/name/category)" />
          </form>
        </div>
        <div className="restaurant-card-container">
          {restaurants.map((restaurant, index) => (
            <div
              className="restaurant-card"
              key={index}
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              <div className="image-container">
                <img src={restaurant.image} alt={restaurant.name} />
              </div>
              <p>{restaurant.name}</p>
            </div>
          ))}
        </div>
        {selectedRestaurant && (
          <Menu
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />
        )}
      </section>
    </>
  );
}
