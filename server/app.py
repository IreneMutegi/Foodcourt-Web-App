from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
from flask_migrate import Migrate
from server.models import db, Client, Admin, Restaurant, Menu, orders_association  
from sqlalchemy import select, insert

import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'postgresql://malldb_u5p5_user:A5tnGchdaALQQYm2ylzxnT73oenbwn77@dpg-cusvqnbqf0us739q23rg-a.oregon-postgres.render.com/malldb_u5p5')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
api = Api(app)
migrate = Migrate(app, db)
CORS(app)

class Welcome(Resource):
    def get(self):
        return {"message": "Welcome to NEXTGEN Food App!"}

api.add_resource(Welcome, '/')


class UserLogin(Resource):
    
    def post(self, table):
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return {"message": "Email and password are required"}, 400

        return self.authenticate_user(table, email, password)

    def authenticate_user(self, table, email, password):
        
        if table == "client":
            user = Client.query.filter_by(email=email).first()
        elif table == "restaurant":
            user = Restaurant.query.filter_by(email=email).first()
        elif table == "admin":
            user = Admin.query.filter_by(email=email).first()
        else:
            return {"message": "Invalid user type"}, 400

        if not user or user.password != password:
            return {"message": "Invalid credentials"}, 401

        return {
            "message": f"{table.capitalize()} login successful!",
            "user": {"id": user.id, "email": user.email, "role": table, "name": user.name}
        }, 200

    def get(self, table):
       
        email = request.args.get("email")

        if not email:
            return {"message": "Email is required"}, 400

        if table == "client":
            user = Client.query.filter_by(email=email).first()
        elif table == "restaurant":
            user = Restaurant.query.filter_by(email=email).first()
        elif table == "admin":
            user = Admin.query.filter_by(email=email).first()
        else:
            return {"message": "Invalid user type"}, 400

        if not user:
            return {"message": "User not found"}, 404

        return {
            "message": f"{table.capitalize()} user found!",
            "user": {"id": user.id, "email": user.email, "role": table}
        }, 200
api.add_resource(UserLogin, "/<string:table>/login")


class UserSignUp(Resource):
    def post(self, table):
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")  

        if not name or not email or not password:
            return {"message": "Name, email, and password are required"}, 400

        if table == "client":
            if Client.query.filter_by(email=email).first():
                return {"message": "Email already exists!"}, 400
            user = Client(name=name, email=email, password=password)
        elif table == "restaurant":
            admin_id = data.get("admin_id")
            if Restaurant.query.filter_by(email=email).first():
                return {"message": "Email already exists!"}, 400
            user = Restaurant(name=name, email=email, password=password, admin_id=admin_id)
        elif table == "admin":
            if Admin.query.filter_by(email=email).first():
                return {"message": "Email already exists!"}, 400
            user = Admin(name=name, email=email, password=password)
        else:
            return {"message": "Invalid user type"}, 400

        db.session.add(user)
        db.session.commit()

        return {"message": f"{table.capitalize()} signed up successfully!", "user": {"id": user.id, "role": table}}, 201



api.add_resource(UserSignUp, "/<string:table>/signup")



class ClientList(Resource):
    def get(self):
        clients = Client.query.all()
        if not clients:
            return {"message": "No clients found"}, 404 
        
        clients_list = [{"id": c.id, "name": c.name, "email": c.email} for c in clients]
        return clients_list, 200  

api.add_resource(ClientList, '/clients')
class RestaurantResource(Resource):
    def post(self):
        data = request.get_json()

        # Get data from the body
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        cuisine = data.get('cuisine')
        admin_id = data.get('admin_id')
        image_url = data.get('image_url')

        if not name or not email or not password or not admin_id:
            return {"error": "Missing required fields"}, 400

        restaurant = Restaurant(
            name=name,
            email=email,
            password=password,
            cuisine=cuisine,
            admin_id=admin_id,
            image_url=image_url
        )

        db.session.add(restaurant)
        db.session.commit()

        return {"message": "Restaurant registered successfully"}, 201

    def get(self, restaurant_id=None, name=None, cuisine=None):
        if restaurant_id:
            # Fetch a single restaurant by ID
            restaurant = Restaurant.query.get(restaurant_id)
            if not restaurant:
                return {"message": "Restaurant not found"}, 404
            return {
                "id": restaurant.id,
                "name": restaurant.name,
                "cuisine": restaurant.cuisine,
                "email": restaurant.email,
                "image_url": restaurant.image_url
            }, 200
        
        if name:
            restaurants = Restaurant.query.filter_by(name=name).all()
            if not restaurants:
                return {"error": "No restaurants found with that name"}, 404
            return [{"id": r.id, "name": r.name, "cuisine": r.cuisine} for r in restaurants], 200
        
        if cuisine:
            restaurants = Restaurant.query.filter_by(cuisine=cuisine).all()
            if not restaurants:
                return {"error": "No restaurants found with that cuisine"}, 404
            return [{"id": r.id, "name": r.name, "cuisine": r.cuisine} for r in restaurants], 200

        restaurants = Restaurant.query.all()
        if not restaurants:
            return {"message": "No restaurants found"}, 404
        return [{"id": r.id, "name": r.name, "cuisine": r.cuisine, "email": r.email, "image_url": r.image_url} for r in restaurants], 200

    def patch(self, restaurant_id):
        data = request.get_json()

        name = data.get('name')
        cuisine = data.get('cuisine')

        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            return {"error": "Restaurant not found"}, 404

        if name:
            restaurant.name = name
        if cuisine:
            restaurant.cuisine = cuisine

        db.session.commit()

        return {"message": "Restaurant updated successfully"}, 200

    def delete(self, restaurant_id):
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            return {"error": "Restaurant not found"}, 404

        db.session.delete(restaurant)
        db.session.commit()

        return {"message": "Restaurant deleted successfully"}, 200


api.add_resource(RestaurantResource, 
                 '/restaurants', 
                 '/restaurants/<int:restaurant_id>', 
                 '/restaurants/name/<string:name>',
                 '/restaurants/cuisine/<string:cuisine>')




class MenuResource(Resource):
    def get(self, restaurant_id):
        meals = Menu.query.filter_by(restaurant_id=restaurant_id).all()
        if not meals:
            return {"error": "No meals found for this restaurant"}, 404

        meal_list = [{"id": m.id, "name": m.name, "category": m.category, "price": m.price, "image_url": m.image_url} for m in meals]
        return {"meals": meal_list}, 200

    def post(self, restaurant_id):
        data = request.get_json()
        name = data.get('name')
        category = data.get('category')
        price = data.get('price')
        image_url = data.get('image_url')

        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            return {"error": "Restaurant not found"}, 404

        meal = Menu(name=name, category=category, price=price, image_url=image_url, restaurant_id=restaurant_id)
        db.session.add(meal)
        db.session.commit()
        return {"message": "Meal added successfully"}, 201

    def patch(self, restaurant_id, meal_id):
        data = request.get_json()
        name = data.get('name')
        category = data.get('category')
        price = data.get('price')
        image_url = data.get('image_url')

        meal = Menu.query.filter_by(id=meal_id, restaurant_id=restaurant_id).first()
        if not meal:
            return {"error": "Meal not found"}, 404

        if name:
            meal.name = name
        if category:
            meal.category = category
        if price:
            meal.price = price
        if image_url:
            meal.image_url = image_url

        db.session.commit()
        return {"message": "Meal updated successfully"}, 200

    def delete(self, restaurant_id, meal_id):
        meal = Menu.query.filter_by(id=meal_id, restaurant_id=restaurant_id).first()
        if not meal:
            return {"error": "Meal not found"}, 404

        db.session.delete(meal)
        db.session.commit()
        return {"message": "Meal deleted successfully"}, 200

api.add_resource(MenuResource, '/menu/restaurant/<int:restaurant_id>/meal/<int:meal_id>', '/menu/restaurant/<int:restaurant_id>')

class OrdersResource(Resource):
    def get(self):
        orders = db.session.execute(
            select(
                orders_association.c.client_id,
                orders_association.c.restaurant_id,
                orders_association.c.meal_id,
                orders_association.c.table_number,
                orders_association.c.quantity
            )
        ).fetchall()

        if not orders:
            return {"message": "No orders found"}, 404

        orders_list = []
        for order in orders:
            client_id, restaurant_id, meal_id, table_number, quantity = order

            meal = Menu.query.get(meal_id)
            client = Client.query.get(client_id)
            restaurant = Restaurant.query.get(restaurant_id)

            orders_list.append({
                "client_id": client_id,
                "client_name": client.name if client else "Unknown Client",
                "restaurant_id": restaurant_id,
                "restaurant_name": restaurant.name if restaurant else "Unknown Restaurant",
                "meal_id": meal_id,
                "meal_name": meal.name if meal else "Unknown Meal",
                "category": meal.category if meal else "Unknown Category",
                "table_number": table_number,
                "quantity": quantity,
                "price": meal.price if meal else "Unknown Price",
                "total": meal.price * quantity if meal else "Unknown Total"
            })

        return {"orders": orders_list}, 200


    # POST a new orde
    def post(self):
        data = request.get_json()  # Getting data from the POST request
        
        try:
            # Inserting order
            db.session.execute(insert(orders_association).values(
                client_id=data['client_id'],
                restaurant_id=data['restaurant_id'],
                meal_id=data['meal_id'],
                table_number=data['table_number'],
                quantity=data['quantity']
            ))
            db.session.commit()  # Committing transaction
            
            return {"message": "Order created successfully"}, 201
        
        except Exception as e:
            db.session.rollback()  # Rollback if there's any error
            return {"message": str(e)}, 500


class OrderGetById(Resource):
    # GET a single order by order_id (referencing client_id)
    def get(self, order_id):
        order = db.session.execute(
            select(orders_association).where(orders_association.c.client_id == order_id)
        ).fetchone()

        if not order:
            return {"error": "Order not found"}, 404

        client_id, restaurant_id, meal_id, table_number, quantity = order

        meal = Menu.query.get(meal_id)
        client = Client.query.get(client_id)
        restaurant = Restaurant.query.get(restaurant_id)

        order_details = {
            "client_id": client_id,
            "client_name": client.name if client else "Unknown Client",
            "restaurant_id": restaurant_id,
            "restaurant_name": restaurant.name if restaurant else "Unknown Restaurant",
            "meal_id": meal_id,
            "meal_name": meal.name if meal else "Unknown Meal",
            "category": meal.category if meal else "Unknown Category",
            "table_number": table_number,
            "quantity": quantity,
            "price": meal.price if meal else "Unknown Price",
            "total": meal.price * quantity if meal else "Unknown Total"
        }

        return {"order": order_details}, 200


class OrderGetByClient(Resource):
    # GET all orders by client_id
    def get(self, client_id):
        orders = db.session.execute(
            select(orders_association).where(orders_association.c.client_id == client_id)
        ).fetchall()

        if not orders:
            return {"message": "No orders found for this client"}, 404

        orders_list = []
        for order in orders:
            _, restaurant_id, meal_id, table_number, quantity = order

            meal = Menu.query.get(meal_id)
            restaurant = Restaurant.query.get(restaurant_id)

            orders_list.append({
                "client_id": client_id,
                "restaurant_id": restaurant_id,
                "restaurant_name": restaurant.name if restaurant else "Unknown Restaurant",
                "meal_id": meal_id,
                "meal_name": meal.name if meal else "Unknown Meal",
                "category": meal.category if meal else "Unknown Category",
                "table_number": table_number,
                "quantity": quantity,
                "price": meal.price if meal else "Unknown Price",
                "total": meal.price * quantity if meal else "Unknown Total"
            })

        return {"orders": orders_list}, 200


class OrderDelete(Resource):
    # DELETE an order by order_id (client_id reference)
    def delete(self, order_id):
        order = db.session.execute(
            select(orders_association).where(orders_association.c.client_id == order_id)
        ).fetchone()

        if not order:
            return {"error": "Order not found"}, 404

        db.session.execute(delete(orders_association).where(orders_association.c.client_id == order_id))
        db.session.commit()

        return {"message": "Order deleted successfully"}, 200


# Registering API routes
api.add_resource(OrdersResource, '/orders')  # GET all orders, POST new order
api.add_resource(OrderGetById, '/orders/<int:order_id>')  # GET order by order_id
api.add_resource(OrderGetByClient, '/orders/client/<int:client_id>')  # GET orders by client_id
api.add_resource(OrderDelete, '/orders/<int:order_id>/delete')  # DELETE order by order_id

class RestaurantOrderGet(Resource):
    def get(self, restaurant_id, client_id, meal_id):
        order = db.session.execute(
            orders_association.select().where(
                (orders_association.c.restaurant_id == restaurant_id) &
                (orders_association.c.client_id == client_id) &
                (orders_association.c.meal_id == meal_id)
            )
        ).fetchone()

        if not order:
            return {"error": "Order not found for this restaurant"}, 404

        table_number = order.table_number
        quantity = order.quantity

        meal = Menu.query.get(meal_id)
        client = Client.query.get(client_id)

        order_details = {
            "client_id": client_id,
            "client_name": client.name if client else "Unknown Client",
            "restaurant_id": restaurant_id,
            "meal_id": meal_id,
            "meal_name": meal.name if meal else "Unknown Meal",
            "category": meal.category if meal else "Unknown Category",
            "table_number": table_number,
            "quantity": quantity,
            "price": meal.price if meal else "Unknown Price",
            "total": meal.price * quantity if meal else "Unknown Total"
        }

        return {"order": order_details}, 200

api.add_resource(RestaurantOrderGet, '/restaurant/<int:restaurant_id>/order/<int:client_id>/<int:meal_id>')

# Restaurant Order Delete
class RestaurantOrderDelete(Resource):
    def delete(self, restaurant_id, order_id):
        order = db.session.execute(
            orders_association.select().where(
                (orders_association.c.restaurant_id == restaurant_id) &
                (orders_association.c.id == order_id)
            )
        ).fetchone()

        if not order:
            return {"error": "Order not found for this restaurant"}, 404

        db.session.execute(
            orders_association.delete().where(
                (orders_association.c.restaurant_id == restaurant_id) &
                (orders_association.c.id == order_id)
            )
        )
        db.session.commit()

        return {"message": "Order deleted successfully"}, 200
api.add_resource(RestaurantOrderDelete, '/restaurant/<int:restaurant_id>/order/<int:order_id>/delete')

# Restaurant Order Patch (update)
# class OrderPatch(Resource):
#     def patch(self, restaurant_id, order_id):
#         data = request.get_json()

#         # Get order details
#         order = db.session.execute(
#             orders_association.select().where(
#                 (orders_association.c.restaurant_id == restaurant_id) &
#                 (orders_association.c.id == order_id)
#             )
#         ).fetchone()

#         if not order:
#             return {"error": "Order not found for this restaurant"}, 404

#         # Update fields if provided
#         table_number = data.get("table_number", order[3])
#         quantity = data.get("quantity", order[4])

#         db.session.execute(
#             orders_association.update().where(
#                 (orders_association.c.restaurant_id == restaurant_id) &
#                 (orders_association.c.id == order_id)
#             ).values(table_number=table_number, quantity=quantity)
#         )
#         db.session.commit()

#         return {"message": "Order updated successfully"}, 200

# api.add_resource(OrderPatch, '/restaurant/<int:restaurant_id>/order/<int:order_id>/update')

if __name__ == "__main__":
    app.run(debug=True, port=5555)
