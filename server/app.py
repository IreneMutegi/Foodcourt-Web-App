from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Admin, Client, Restaurant, Menu, Order

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://cullen:kaberere@localhost/malldb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'

migrate = Migrate(app, db)

CORS(app)  # Enable CORS for frontend communication

db.init_app(app)
@app.route('/')
def home():
    return jsonify({"message": "Welcome to NEXTGEN Food App!"})

@app.route('/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    if not clients:
        return jsonify({"message": "No clients found"}), 404
    clients_list = [{"id": c.id, "name": c.name, "email": c.email} for c in clients]
    return jsonify(clients_list), 200

@app.route('/clients/<int:client_id>', methods=['GET'])
def get_client_by_id(client_id):
    client = Client.query.get(client_id)
    if not client:
        return jsonify({"error": "Client not found"}), 404
    return jsonify({"id": client.id, "name": client.name, "email": client.email}), 200

@app.route('/admins', methods=['GET'])
def get_admins():
    admins = Admin.query.all()
    admins_list = [{"id": a.id, "name": a.name, "email": a.email} for a in admins]
    return jsonify(admins_list), 200

# @app.route('/restaurants', methods=['GET'])
# def get_restaurants():
#     restaurants = Restaurant.query.all()
#     restaurants_list = [
#         {"id": r.id, "name": r.name, "cuisine": r.cuisine, "email": r.email, "image_url": r.image_url}
#         for r in restaurants
#     ]
#     return jsonify(restaurants_list), 200

# @app.route('/menus', methods=['GET'])
# def get_menus():
#     menus = Menu.query.all()
#     menus_list = [{"id": m.id, "name": m.name, "price": m.price, "category": m.category} for m in menus]
#     return jsonify(menus_list), 200

# @app.route('/orders', methods=['GET'])
# def get_orders():
#     orders = Order.query.all()
#     orders_list = [
#         {"id": o.id, "client_id": o.client_id, "restaurant_id": o.restaurant_id, "table_number": o.table_number, "quantity": o.quantity}
#         for o in orders
#     ]
#     return jsonify(orders_list), 200

# CLIENT SIGNUP ROUTE
@app.route('/clients/signup', methods=['POST'])
def client_signup():
    data = request.get_json()

    # Ensure required fields are present
    if not data or not all(key in data for key in ("name", "email", "password")):
        return jsonify({"error": "Name, email, and password are required"}), 400

    # Check if the email already exists
    existing_client = Client.query.filter_by(email=data["email"]).first()
    if existing_client:
        return jsonify({"error": "Email already in use"}), 409

    # Hash the password before storing
    hashed_password = generate_password_hash(data["password"])
    new_client = Client(name=data["name"], email=data["email"], password=hashed_password)

    db.session.add(new_client)
    db.session.commit()

    return jsonify({
        "message": "Signup successful",
        "client_id": new_client.id,
        "name": new_client.name,
        "email": new_client.email
    }), 201

# CLIENT LOGIN ROUTE
@app.route('/clients/login', methods=['POST'])
def client_login():
    data = request.get_json()

    # Ensure required fields are present
    if not data or not all(key in data for key in ("email", "password")):
        return jsonify({"error": "Email and password are required"}), 400

    # Find client by email
    client = Client.query.filter_by(email=data["email"]).first()

    # Verify password
    if client and check_password_hash(client.password, data["password"]):
        return jsonify({
            "message": "Login successful",
            "client_id": client.id,
            "name": client.name,
            "email": client.email
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401

# Restaurants
@app.route('/restaurants', methods=['GET'])
def get_restaurants():
    restaurants = Restaurant.query.all()
    return jsonify([{ "id": r.id, "name": r.name, "cuisine": r.cuisine, "email": r.email } for r in restaurants]), 200

@app.route('/restaurants/register', methods=['POST'])
def register_restaurant():
    data = request.get_json()
    new_restaurant = Restaurant(
        name=data.get('name'),
        email=data.get('email'),
        password=generate_password_hash(data.get('password')),
        cuisine=data.get('cuisine'),
        admin_id=data.get('admin_id')
    )
    db.session.add(new_restaurant)
    db.session.commit()
    return jsonify({"message": "Restaurant registered successfully"}), 201

@app.route('/restaurants/update', methods=['PATCH'])
def update_restaurant():
    data = request.get_json()
    restaurant = Restaurant.query.get(data.get('id'))
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404
    
    restaurant.name = data.get('name', restaurant.name)
    restaurant.cuisine = data.get('cuisine', restaurant.cuisine)
    db.session.commit()
    return jsonify({"message": "Restaurant updated successfully"}), 200

@app.route('/meals', methods=['GET', 'POST'])
def handle_meals():
    if request.method == 'GET':
        meals = Menu.query.all()
        return jsonify([{ "id": meal.id, "name": meal.name, "category": meal.category, "price": meal.price, "image_url": meal.image_url } for meal in meals]), 200
    
    data = request.get_json()
    new_meal = Menu(
        name=data.get('name'),
        category=data.get('category'),
        price=data.get('price'),
        image_url=data.get('image_url')
    )
    db.session.add(new_meal)
    db.session.commit()
    return jsonify({"message": "Meal added successfully"}), 201

@app.route('/meal/<int:meal_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_meal(meal_id):
    meal = Menu.query.get(meal_id)
    if not meal:
        return jsonify({"error": "Meal not found"}), 404
    
    if request.method == 'GET':
        return jsonify({ "id": meal.id, "name": meal.name, "category": meal.category, "price": meal.price, "image_url": meal.image_url }), 200
    
    if request.method == 'PUT':
        data = request.get_json()
        meal.name = data.get('name', meal.name)
        meal.category = data.get('category', meal.category)
        meal.price = data.get('price', meal.price)
        meal.image_url = data.get('image_url', meal.image_url)
        db.session.commit()
        return jsonify({"message": "Meal updated successfully"}), 200
    
    db.session.delete(meal)
    db.session.commit()
    return jsonify({"message": "Meal deleted successfully"}), 200

@app.route('/orders', methods=['POST'])
def place_order():
    try:
        data = request.get_json()
        client_id = data.get('client_id')
        restaurant_id = data.get('restaurant_id')
        table_number = data.get('table_number')
        meals = data.get('meals')

        if not client_id or not restaurant_id or not meals or not table_number:
            return jsonify({"error": "Missing required fields"}), 400

        for meal_entry in meals:
            meal = Menu.query.get(meal_entry.get('meal_id'))
            if meal:
                new_order = Order(
                    client_id=client_id,
                    restaurant_id=restaurant_id,
                    meal_id=meal.id,
                    table_number=table_number,
                    quantity=meal_entry.get('quantity', 1), 
                    price=meal.price,
                    total=meal_entry.get('quantity', 1) * meal.price
                )
                db.session.add(new_order)

        db.session.commit()
        return jsonify({"message": "Order placed successfully"}), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Error placing order: {str(e)}")  # Log the actual error
        return jsonify({"error": "Failed to place order", "details": str(e)}), 500


@app.route('/orders/client/<int:client_id>', methods=['GET'])
def get_client_orders(client_id):
    orders = Order.query.filter_by(client_id=client_id).all()
    if not orders:
        return jsonify({"message": "No orders found"}), 404
    return jsonify([{ "restaurant_id": o.restaurant_id, "meal_id": o.meal_id, "table_number": o.table_number, "quantity": o.quantity } for o in orders]), 200

@app.route('/orders/restaurant/<int:restaurant_id>', methods=['GET'])
def get_restaurant_orders(restaurant_id):
    orders = Order.query.filter_by(restaurant_id=restaurant_id).all()
    if not orders:
        return jsonify({"message": "No orders found"}), 404
    return jsonify([{ "client_id": o.client_id, "meal_id": o.meal_id, "table_number": o.table_number, "quantity": o.quantity } for o in orders]), 200
#get orders
@app.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    if not orders:
        return jsonify({"message": "No orders found"}), 404
    return jsonify([
        {
            "id": o.id,
            "client_id": o.client_id,
            "restaurant_id": o.restaurant_id,
            "meal_id": o.meal_id,
            "table_number": o.table_number,
            "quantity": o.quantity
        }
        for o in orders
    ]), 200

@app.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    db.session.delete(order)
    db.session.commit()
    
    return jsonify({"message": "Order deleted successfully"}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensure tables are created
    app.run(debug=True, port=5555)
