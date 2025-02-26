import { Star, Utensils, ChefHat,  Lamp} from "lucide-react";
import { Card, CardContent } from "./Card";  // Import Card and CardContent from the same folder
import './page.css';  // Import your custom styles

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="hero-section1">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Discover Culinary Excellence</h1>
          <p className="hero-description">
            Experience a world of flavors at our premium dining destinations
          </p>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="what-we-offer">
        <h2 className="section-title">What We Offer</h2>
        <div className="cards-container">
          {/* Card for Restaurants */}
          <Card>
            <div className="card-image restaurants"></div>
            <CardContent>
              <h3 className="card-title">Restaurants</h3>
              <p className="card-description">Diverse selection of casual and family-friendly restaurants</p>
              <div className="card-rating">
                <Star className="star-icon" />
                <span className="rating">4.8</span>
              </div>
            </CardContent>
          </Card>

          {/* Card for Fine Dining */}
          <Card>
            <div className="card-image fine-dining"></div>
            <CardContent>
              <h3 className="card-title">Fine Dining</h3>
              <p className="card-description">Exquisite culinary experiences in elegant settings</p>
              <div className="card-rating">
                <Star className="star-icon" />
                <span className="rating">4.9</span>
              </div>
            </CardContent>
          </Card>

          <Card>
      <div className="card-image cocktails"></div>
      <CardContent>
        <h3 className="card-title">Cocktails</h3>
        <p className="card-description">Craft cocktails and an extensive drink menu in stylish atmospheres</p>
        <div className="card-rating flex items-center gap-1">
          <Star className="star-icon w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="rating text-yellow-400">4.7</span>
        </div>
      </CardContent>
      </Card>

      <Card>
      <div className="card-image deserts"></div>
      <CardContent>
        <h3 className="card-title">Deserts</h3>
        <p className="card-description">Delicious and indulgent treats to satisfy your sweet tooth</p>
        <div className="card-rating flex items-center gap-1">
          <Star className="star-icon w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="rating text-yellow-400">4.8</span>
        </div>
      </CardContent>
      </Card>

          {/* More cards... */}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <h2 className="section-title">Why Choose Our Restaurants</h2>
          <div className="cards-container">
            {/* Icon card for Diverse Cuisine */}
            <div className="icon-card">
              <div className="icon-circle">
                <Utensils className="icon" />
              </div>
              <h3 className="card-title">Diverse Cuisine</h3>
              <p className="card-description">Experience flavors from around the world</p>
            </div>

          {/* Icon card for Expert Chefs */}
<div className="icon-card">
  <div className="icon-circle">
    <ChefHat className="icon" /> {/* Replaced image with ChefHat icon */}
  </div>
  <h3 className="card-title">Expert Chefs</h3>
  <p className="card-description">Skilled chefs crafting exquisite dishes</p>
</div>

{/* Icon card for Cozy Ambience */}
<div className="icon-card">
  <div className="icon-circle">
    <Lamp className="icon" /> {/* Replaced image with Lamp icon */}
  </div>
  <h3 className="card-title">Cozy Ambience</h3>
  <p className="card-description">Relax and unwind in a welcoming atmosphere</p>
</div>


      {/* Icon card for Exceptional Service */}
      <div className="icon-card">
  <div className="icon-circle">
    <Star className="icon" /> {/* Replaced image with the Star icon */}
  </div>
  <h3 className="card-title">Exceptional Service</h3>
  <p className="card-description">Our staff ensures every meal is a memorable experience</p>
</div>


     
          </div>
        </div>
      </section>
    </main>
  );
}
