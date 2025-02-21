"use client";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>About Us</h1>
      <p style={styles.text}>
        Welcome to <strong>Next Gen</strong>, your go-to destination for delicious food! 
        We bring together the best restaurants to serve you top-quality meals, delivered fresh to your doorstep.
      </p>

      {/* Restaurants Section */}
      <h2 style={styles.subHeading}>🍽️ Our Restaurants</h2>
      <div style={styles.imageContainer}>
        {restaurants.map((restaurant) => (
         <div key={restaurant.image} className="image-wrapper">
         <Image 
           src={restaurant.image} 
           alt="Restaurant" 
           layout="fill" 
           objectFit="contain"
           className="restaurant-image"
         />
       </div>
        ))}
      </div>

      {/* Services Section */}
      <h2 style={styles.subHeading}>🚀 Our Services</h2>
      <ul style={styles.list}>
        <li><strong>Fast Delivery</strong> – Get your food delivered hot and fresh in no time.</li>
        <li><strong>Easy Ordering</strong> – Order through our seamless online platform.</li>
        <li><strong>Custom Meal Plans</strong> – Personalized meal subscriptions for busy schedules.</li>
        <li><strong>24/7 Customer Support</strong> – We're here for you anytime, anywhere.</li>
      </ul>

      <p style={styles.text}>
        At <strong>Next Gen</strong>, we believe food is more than just a meal—it's an experience!  
        Thank you for choosing us. Bon appétit! 🍕🍜🍔 
      </p>

      {/* Global Styles for Hover Effect */}
      <style jsx>{`
        .image-wrapper {
          width: 250px;
          height: 150px;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          transition: transform 0.3s ease-in-out;
        }

        .image-wrapper:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

// Restaurant Data
const restaurants = [
  { image: "/restaurants/chickeninn.jpg" },
  { image: "/restaurants/pizzainn.jpg"},
  {image: "/restaurants/artcaffe.webp"},
  
];

// Inline styles
const styles = {
  container: {
    padding: "20px",
    maxWidth: "100%",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    background: "#5655553f",
  },
  heading: {
    fontSize: "4em",
    color: "#02a999",
  },
  subHeading: {
    fontSize: "1.5em",
    marginTop: "20px",
    color: "#02a999",
  },
  text: {
    fontSize: "1.4em",
    lineHeight: "1.6",
    color: "#666",
  },
  list: {
    textAlign: "center",
    fontSize: "1.1em",
    margin: "10px 0",
    paddingLeft: "0",
    listStyle: "none",
  },
  imageContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    justifyContent: "center",
    padding: "20px",
  },
  
};
