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

@app.route('/restaurants', methods=['GET'])
def get_restaurants():
    restaurants = Restaurant.query.all()
    restaurants_list = [
        {"id": r.id, "name": r.name, "cuisine": r.cuisine, "email": r.email, "image_url": r.image_url}
        for r in restaurants
    ]
    return jsonify(restaurants_list), 200

@app.route('/menus', methods=['GET'])
def get_menus():
    menus = Menu.query.all()
    menus_list = [{"id": m.id, "name": m.name, "price": m.price, "category": m.category} for m in menus]
    return jsonify(menus_list), 200

@app.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    orders_list = [
        {"id": o.id, "client_id": o.client_id, "restaurant_id": o.restaurant_id, "table_number": o.table_number, "quantity": o.quantity}
        for o in orders
    ]
    return jsonify(orders_list), 200

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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensure tables are created
    app.run(debug=True)
