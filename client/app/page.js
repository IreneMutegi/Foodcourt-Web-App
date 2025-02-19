import img1 from "../public/images/artcaffe.jpeg";
import img2 from "../public/images/chicken.jpeg";
import img3 from "../public/images/pizza.jpeg";
import "./page.css";
export default function Home() {
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
          <div className="restaurant-card">
            <div className="image-container">
                <img src={img3}/>
            </div>
            <p>Pizza Inn</p>
          </div>
          <div className="restaurant-card">
            <div className="image-container">
                <img src={img3}/>
            </div>
            <p>Pizza Inn</p>
          </div>
          <div className="restaurant-card">
            <div className="image-container">
                <img src={img3}/>
            </div>
            <p>Pizza Inn</p>
          </div>
          <div className="restaurant-card">
            <div className="image-container">
                <img src={img3}/>
            </div>
            <p>Pizza Inn</p>
          </div>
          <div className="restaurant-card">
            <div className="image-container">
                <img src={img3}/>
            </div>
            <p>Pizza Inn</p>
          </div>
          <div className="restaurant-card">
            <div className="image-container">
                <img src={img3}/>
            </div>
            <p>Pizza Inn</p>
          </div>
        </div>
      </section>
    </>
  );
}
