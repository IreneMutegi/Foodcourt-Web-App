from flask import Flask, request
# from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource
from models import db, Client, Restaurant, Menu,orders_association  
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://irene:password@localhost:5432/malldb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db = SQLAlchemy()
db.init_app(app)
api = Api(app)
migrate = Migrate(app, db)

class Welcome(Resource):
    def get(self):
        return {
            "message": "Welcome to NEXTGEN Food App!",
        }

api.add_resource(Welcome, '/')


# Client Registration
class RegisterClient(Resource):
    def post(self):
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        client = Client(name=name, email=email, password=password)
        db.session.add(client)
        db.session.commit()
        return {"message": "Client registered successfully"}, 201

api.add_resource(RegisterClient, '/register/client')


# Restaurant Registration
class RegisterRestaurant(Resource):
    def post(self):
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        cuisine = data.get('cuisine')
        admin_id = admin_id = data.get('admin_id') 
        
        restaurant = Restaurant(name=name, email=email, password=password, cuisine=cuisine, admin_id=admin_id)
        db.session.add(restaurant)
        db.session.commit()
        return {"message": "Restaurant registered successfully"}, 201

api.add_resource(RegisterRestaurant, '/register/restaurant')


# Client Login
class LoginClient(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        client = Client.query.filter_by(email=email).first()
        if client and client.password == password:
            return {"message": "Client login successful", "user_id": client.id}, 200
        return {"error": "Invalid email or password for Client"}, 401

api.add_resource(LoginClient, '/login/client')


# Restaurant Login
class LoginRestaurant(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        restaurant = Restaurant.query.filter_by(email=email).first()
        if restaurant and restaurant.password == password:
            return {"message": "Restaurant login successful", "user_id": restaurant.id}, 200
        return {"error": "Invalid email or password for Restaurant"}, 401

api.add_resource(LoginRestaurant, '/login/restaurant')
class RestaurantList(Resource):
    def get(self):
        # Fetch all restaurants
        restaurants = Restaurant.query.all()
        if not restaurants:
            return {"error": "No restaurants found"}, 404
        
        # Prepare a list of restaurant details to return
        restaurant_list = [
            {"id": r.id, "name": r.name, "cuisine": r.cuisine} for r in restaurants
        ]
        return {"restaurants": restaurant_list}, 200
api.add_resource(RestaurantList, '/restaurants')

class RestaurantByName(Resource):
    def get(self, name):
        restaurants = Restaurant.query.filter_by(name=name).all()
        if not restaurants:
            return {"error": "No restaurants found with that name"}, 404
        return [{"id": r.id, "name": r.name, "cuisine": r.cuisine} for r in restaurants], 200

api.add_resource(RestaurantByName, '/restaurants/name/<string:name>')


class RestaurantByCuisine(Resource):
    def get(self, cuisine):
        restaurants = Restaurant.query.filter_by(cuisine=cuisine).all()
        if not restaurants:
            return {"error": "No restaurants found with that cuisine"}, 404
        return [{"id": r.id, "name": r.name, "cuisine": r.cuisine} for r in restaurants], 200

api.add_resource(RestaurantByCuisine, '/restaurants/cuisine/<string:cuisine>')


# Meal Management
class MealList(Resource):
    def get(self):
        meals = Menu.query.all()
        meal_list = []
        for meal in meals:
            meal_list.append({
                "id": meal.id,
                "name": meal.name,
                "category": meal.category,
                "price": meal.price,
                "image_url": meal.image_url
            })
        return {"meals": meal_list}, 200

    def post(self):
        data = request.get_json()
        name = data.get('name')
        category = data.get('category')
        price = data.get('price')
        image_url = data.get('image_url')
        
        meal = Menu(name=name, category=category, price=price, image_url=image_url)
        db.session.add(meal)
        db.session.commit()
        return {"message": "Meal added successfully"}, 201

api.add_resource(MealList, '/meals')


# Single Meal - GET, PUT, DELETE by meal ID
class Meal(Resource):
    def get(self, meal_id):
        meal = Menu.query.get(meal_id)
        if not meal:
            return {"error": "Meal not found"}, 404
        return {
            "id": meal.id,
            "name": meal.name,
            "category": meal.category,
            "price": meal.price,
            "image_url": meal.image_url  # Updated attribute
        }, 200

    def put(self, meal_id):
        meal = Menu.query.get(meal_id)
        if not meal:
            return {"error": "Meal not found"}, 404

        data = request.get_json()
        meal.name = data.get('name', meal.name)
        meal.category = data.get('category', meal.category)
        meal.price = data.get('price', meal.price)
        meal.image_url = data.get('image_url', meal.image_url)  # Updated attribute
        db.session.commit()
        return {"message": "Meal updated successfully"}, 200

    def delete(self, meal_id):
        meal = Menu.query.get(meal_id)
        if not meal:
            return {"error": "Meal not found"}, 404
        db.session.delete(meal)
        db.session.commit()
        return {"message": "Meal deleted successfully"}, 200

api.add_resource(Meal, '/meal/<int:meal_id>')



class ClientOrdersPost(Resource):
    def post(self):
        data = request.get_json()
        client_id = data.get('client_id')
        restaurant_id = data.get('restaurant_id')
        table_number = data.get('table_number')
        meals = data.get('meals')  

        if not client_id or not restaurant_id or not meals or not table_number:
            return {"error": "client_id, restaurant_id, table_number, and meals are required"}, 400

        for meal_entry in meals:
            meal_id = meal_entry.get("meal_id")
            quantity = meal_entry.get("quantity", 1)  # Default quantity to 1

            meal = Menu.query.get(meal_id)
            if meal:
                stmt = orders_association.insert().values(
                    client_id=client_id,
                    restaurant_id=restaurant_id,
                    meal_id=meal_id,  # Now inserting meal_id
                    table_number=table_number,
                    quantity=quantity
                )
                db.session.execute(stmt)

        db.session.commit()

        return {"message": "Order placed successfully"}, 201
api.add_resource(ClientOrdersPost, '/orders')

class ClientOrdersGet(Resource):
    def get(self, client_id):
        if not client_id:
            return {"error": "client_id is required"}, 400

        query = db.session.execute(
            orders_association.select().where(orders_association.c.client_id == client_id)
        ).fetchall()

        if not query:
            return {"message": "No orders found for this client"}, 404

        orders_list = []
        for row in query:
            meal = Menu.query.get(row.meal_id)  # Fetch meal details
            if meal:
                orders_list.append({
                    "restaurant_id": row.restaurant_id,
                    "table_number": row.table_number,
                    "meal_id": meal.id,
                    "meal_name": meal.name,
                    "category": meal.category,
                    "quantity": row.quantity
                })

        return {"orders": orders_list}, 200


api.add_resource(ClientOrdersGet, '/orders/client/<int:client_id>')


class RestaurantOrders(Resource):
    def get(self, restaurant_id):
        orders = db.session.execute(
            orders_association.select().where(orders_association.c.restaurant_id == restaurant_id)
        ).fetchall()

        if not orders:
            return {"error": "No orders found for this restaurant"}, 404

        orders_list = []
        for order in orders:
            client = Client.query.get(order.client_id)
            meal = Menu.query.get(order.meal_id)
            
            if client and meal:
                orders_list.append({
                    "order_id": f"{order.client_id}-{order.restaurant_id}-{order.meal_id}",
                    "client_name": client.name,
                    "client_email": client.email,
                    "meal_name": meal.name,
                    "meal_price": meal.price,
                    "quantity": order.quantity,
                    "table_number": order.table_number
                })

        return {"orders": orders_list}, 200
api.add_resource(RestaurantOrders, '/orders/restaurant/<int:restaurant_id>')

class RestaurantOrdersPut(Resource):
    def put(self, client_id, restaurant_id, meal_id):
        order = db.session.execute(
            orders_association.select().where(
                orders_association.c.client_id == client_id,
                orders_association.c.restaurant_id == restaurant_id,
                orders_association.c.meal_id == meal_id
            )
        ).fetchone()

        if not order:
            return {"error": "Order not found"}, 404

        data = request.get_json()
        quantity = data.get('quantity', order.quantity)
        table_number = data.get('table_number', order.table_number)

        # Update the order in the association table
        stmt = orders_association.update().where(
            orders_association.c.client_id == client_id,
            orders_association.c.restaurant_id == restaurant_id,
            orders_association.c.meal_id == meal_id
        ).values(
            quantity=quantity,
            table_number=table_number
        )
        db.session.execute(stmt)
        db.session.commit()

        return {"message": "Order updated successfully"}, 200


api.add_resource(RestaurantOrdersPut, '/orders/restaurant/<int:client_id>/<int:restaurant_id>/<int:meal_id>')



if __name__ == '__main__':
    app.run(port=5555, debug=True)
