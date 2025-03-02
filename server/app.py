from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
from flask_migrate import Migrate
from server.models import db, Client, Admin, Restaurant, Menu, orders_association, reservation_association ,RestaurantTable
from sqlalchemy import select, delete , DateTime
from datetime import datetime
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


# class OrderGetById(Resource):
#     def get(self, order_id):
#         order = db.session.execute(
#             orders_association.select().where(
#                 (orders_association.c.client_id == order_id)
#             )
#         ).fetchone()

#         if not order:
#             return {"error": "Order not found"}, 404

#         client_id = order[0]
#         restaurant_id = order[1]
#         meal_id = order[2]
#         table_number = order[3]
#         quantity = order[4]

#         meal = Menu.query.get(meal_id)
#         client = Client.query.get(client_id)
#         restaurant = Restaurant.query.get(restaurant_id)

#         order_details = {
#             "client_id": client_id,
#             "client_name": client.name if client else "Unknown Client",
#             "restaurant_id": restaurant_id,
#             "restaurant_name": restaurant.name if restaurant else "Unknown Restaurant",
#             "meal_id": meal_id,
#             "meal_name": meal.name if meal else "Unknown Meal",
#             "category": meal.category if meal else "Unknown Category",
#             "table_number": table_number,
#             "quantity": quantity,
#             "price": meal.price if meal else "Unknown Price",
#             "total": meal.price * quantity if meal else "Unknown Total"
#         }

#         return {"order": order_details}, 200

# api.add_resource(OrderGetById, '/orders/<int:order_id>')





class OrdersResource(Resource):
    def get(self, client_id=None):
        if client_id:
            orders = db.session.execute(
                select(
                    orders_association.c.client_id,
                    orders_association.c.reservation_id,
                    orders_association.c.restaurant_id,
                    orders_association.c.meal_id,
                    orders_association.c.table_number,
                    orders_association.c.quantity,
                    orders_association.c.price,
                    orders_association.c.total,
                    orders_association.c.status  # Fetch status as well
                ).where(orders_association.c.client_id == client_id)
            ).fetchall()
        else:
            orders = db.session.execute(
                select(
                    orders_association.c.client_id,
                    orders_association.c.reservation_id,  # Include reservation_id
                    orders_association.c.restaurant_id,
                    orders_association.c.meal_id,
                    orders_association.c.table_number,
                    orders_association.c.quantity,
                    orders_association.c.price,
                    orders_association.c.total,
                    orders_association.c.status  # Fetch status as well
                )
            ).fetchall()

        if not orders:
            return {"message": "No orders found"}, 404

        orders_list = []
        for order in orders:
            client_id, reservation_id, restaurant_id, meal_id, table_number, quantity, price, total, status = order

            meal = Menu.query.get(meal_id)
            client = Client.query.get(client_id)
            restaurant = Restaurant.query.get(restaurant_id)

            orders_list.append({
                "client_id": client_id,
                "client_name": client.name if client else "Unknown Client",
                "reservation_id": reservation_id,  # Include reservation_id
                "restaurant_id": restaurant_id,
                "restaurant_name": restaurant.name if restaurant else "Unknown Restaurant",
                "meal_id": meal_id,
                "meal_name": meal.name if meal else "Unknown Meal",
                "category": meal.category if meal else "Unknown Category",
                "table_number": table_number,
                "quantity": quantity,
                "price": price,
                "total": total,
                "status": status  # Include status in response
            })

        return {"orders": orders_list}, 200

    def post(self):
        data = request.get_json()

        client_id = data.get("client_id")
        restaurant_id = data.get("restaurant_id")
        meal_id = data.get("meal_id")
        table_number = data.get("table_number")
        quantity = data.get("quantity")
        reservation_id = data.get("reservation_id")  # Include reservation_id
        status = data.get("status", "Pending")  # Default to "Pending" if no status is provided

        if not all([client_id, restaurant_id, meal_id, table_number, quantity, reservation_id]):
            return {"error": "client_id, restaurant_id, table_number, meal_id, quantity, and reservation_id are required"}, 400

        meal = Menu.query.get(meal_id)
        if not meal:
            return {"error": "Invalid meal_id"}, 400

        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            return {"error": "Invalid restaurant_id"}, 400

        price = meal.price
        total = price * quantity

        try:
            new_order = orders_association.insert().values(
                client_id=client_id,
                restaurant_id=restaurant_id,
                meal_id=meal_id,
                table_number=table_number,
                quantity=quantity,
                price=price,
                total=total,
                reservation_id=reservation_id,  # Include reservation_id
                status=status  # Set the status to "Pending" or the provided status
            )
            db.session.execute(new_order)
            db.session.commit()

            return {"message": "Order created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    def patch(self, client_id):
        data = request.get_json()

        if not client_id:
            return {"error": "client_id is required"}, 400

        order = db.session.execute(
            select(orders_association).where(orders_association.c.client_id == client_id)
        ).fetchone()

        if not order:
            return {"error": "No order found for this client"}, 404

        update_data = {}

        if "meal_id" in data:
            meal = Menu.query.get(data["meal_id"])
            if not meal:
                return {"error": "Invalid meal_id"}, 400
            update_data["meal_id"] = data["meal_id"]
            update_data["price"] = meal.price  

        if "quantity" in data:
            update_data["quantity"] = data["quantity"]
            if "meal_id" in data or "price" in update_data:
                update_data["total"] = update_data["price"] * data["quantity"]
            else:
                update_data["total"] = order.total / order.quantity * data["quantity"]

        if "table_number" in data:
            update_data["table_number"] = data["table_number"]

        if "reservation_id" in data:  # Allow updating reservation_id
            update_data["reservation_id"] = data["reservation_id"]

        if "status" in data:  # Allow updating status
            update_data["status"] = data["status"]

        if update_data:
            try:
                db.session.execute(
                    orders_association.update()
                    .where(orders_association.c.client_id == client_id)
                    .values(update_data)
                )
                db.session.commit()
                return {"message": "Order updated successfully"}, 200
            except Exception as e:
                db.session.rollback()
                return {"error": str(e)}, 500

        return {"message": "No updates provided"}, 400

    def delete(self, client_id):
        if not client_id:
            return {"error": "client_id is required"}, 400

        orders = db.session.execute(
            select(orders_association).where(orders_association.c.client_id == client_id)
        ).fetchall()

        if not orders:
            return {"error": "No orders found for this client"}, 404

        try:
            db.session.execute(
                delete(orders_association).where(orders_association.c.client_id == client_id)
            )
            db.session.commit()
            return {"message": "Orders deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

# Register the resource and the endpoints with the Api object
api.add_resource(OrdersResource, '/orders', '/orders/<int:client_id>')




class RestaurantOrderResource(Resource):
    # GET - Retrieve all orders for a specific restaurant
    def get(self, restaurant_id):
        orders = db.session.execute(
            select(
                orders_association.c.client_id,
                orders_association.c.meal_id,
                orders_association.c.restaurant_table_id,
                orders_association.c.quantity,
                orders_association.c.status,  # Include status in the GET response
                orders_association.c.timestamp  # Include timestamp for better tracking
            ).where(orders_association.c.restaurant_id == restaurant_id)
        ).fetchall()

        if not orders:
            return {"error": "No orders found for this restaurant"}, 404

        orders_list = []
        for order in orders:
            client_id = order[0]  # Access client_id by index
            meal_id = order[1]  # Access meal_id by index
            table_id = order[2]  # Access restaurant_table_id by index
            quantity = order[3]  # Access quantity by index
            status = order[4]  # Access order status by index
            timestamp = order[5]  # Access timestamp for the order

            meal = Menu.query.get(meal_id)
            client = Client.query.get(client_id)
            restaurant_table = RestaurantTable.query.get(table_id)

            orders_list.append({
                "client_id": client_id,
                "client_name": client.name if client else "Unknown Client",
                "meal_id": meal_id,
                "meal_name": meal.name if meal else "Unknown Meal",
                "category": meal.category if meal else "Unknown Category",
                "table_number": restaurant_table.table_number if restaurant_table else "Unknown Table",
                "quantity": quantity,
                "price": meal.price if meal else "Unknown Price",
                "total": meal.price * quantity if meal else "Unknown Total",
                "status": status,
                "timestamp": timestamp
            })

        return {"orders": orders_list}, 200

    # PATCH - Update an existing order for a specific restaurant and client
    def patch(self, restaurant_id, client_id):
        data = request.get_json()

        # Find the existing order for the restaurant and client
        order = db.session.execute(
            select(orders_association).where(
                (orders_association.c.restaurant_id == restaurant_id) & 
                (orders_association.c.client_id == client_id)
            )
        ).fetchone()

        if not order:
            return {"error": "Order not found for this restaurant and client"}, 404

        # Prepare the update data (quantity, table_number, status, etc.)
        update_data = {}
        if "quantity" in data:
            update_data["quantity"] = data["quantity"]

        if "table_number" in data:
            update_data["restaurant_table_id"] = data["table_number"]

        if "status" in data:
            update_data["status"] = data["status"]

        if not update_data:
            return {"error": "No fields to update"}, 400

        try:
            db.session.execute(
                orders_association.update()
                .where(
                    (orders_association.c.restaurant_id == restaurant_id) & 
                    (orders_association.c.client_id == client_id)
                )
                .values(update_data)
            )
            db.session.commit()
            return {"message": "Order updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    # DELETE - Delete an order for a specific restaurant and client
    def delete(self, restaurant_id, client_id):
        # Find the order for this restaurant and client
        order = db.session.execute(
            select(orders_association).where(
                (orders_association.c.restaurant_id == restaurant_id) & 
                (orders_association.c.client_id == client_id)
            )
        ).fetchone()

        if not order:
            return {"error": "Order not found for this restaurant and client"}, 404

        try:
            db.session.execute(
                orders_association.delete().where(
                    (orders_association.c.restaurant_id == restaurant_id) & 
                    (orders_association.c.client_id == client_id)
                )
            )
            db.session.commit()
            return {"message": "Order deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500


# Register the resource and the endpoints with the Api object
api.add_resource(RestaurantOrderResource, 
                 '/orders/restaurants/<int:restaurant_id>', 
                 '/orders/restaurants/<int:restaurant_id>/client/<int:client_id>')


class ReservationResource(Resource):
    # Get reservations (for a specific client or all reservations)
    def get(self, client_id=None): 
        if client_id:
            # Get reservations for a specific client
            reservations = db.session.execute(
                select(
                    reservation_association.c.client_id,
                    reservation_association.c.restaurant_table_id,
                    reservation_association.c.date,
                    reservation_association.c.time,
                    reservation_association.c.timestamp
                ).where(reservation_association.c.client_id == client_id)
            ).fetchall()
        else:
            # Get all reservations
            reservations = db.session.execute(
                select(
                    reservation_association.c.client_id,
                    reservation_association.c.restaurant_table_id,
                    reservation_association.c.date,
                    reservation_association.c.time,
                    reservation_association.c.timestamp
                )
            ).fetchall()

        if not reservations:
            return {"message": "No reservations found"}, 404

        reservations_list = []
        for reservation in reservations:
            client_id, restaurant_table_id, date, time, timestamp = reservation

            # Get client and restaurant table details
            client = Client.query.get(client_id)
            restaurant_table = RestaurantTable.query.get(restaurant_table_id)

            # Combine date and time to return a full reservation datetime
            reservation_datetime = f"{date} {time}" if time else date

            # Convert timestamp (datetime object) to string before adding to response
            timestamp_str = timestamp.strftime('%Y-%m-%d %H:%M:%S') if timestamp else None

            reservations_list.append({
                "client_id": client_id,
                "client_name": client.name if client else "Unknown Client",
                "restaurant_table_id": restaurant_table_id,
                "table_number": restaurant_table.table_number if restaurant_table else "Unknown Table",
                "reservation_datetime": reservation_datetime,
                "timestamp": timestamp_str  # Return the string version of timestamp
            })

        return {"reservations": reservations_list}, 200

    # Create a new reservation
    def post(self):
        data = request.get_json()

        client_id = data.get("client_id")
        restaurant_table_id = data.get("restaurant_table_id")
        reservation_date = data.get("reservation_date")  # Separate date
        reservation_time = data.get("reservation_time")  # Separate time
        
        if not all([client_id, restaurant_table_id, reservation_date, reservation_time]):
            return {"error": "client_id, restaurant_table_id, reservation_date, and reservation_time are required"}, 400

        # Validate client and table existence
        client = Client.query.get(client_id)
        if not client:
            return {"error": "Invalid client_id"}, 400

        restaurant_table = RestaurantTable.query.get(restaurant_table_id)
        if not restaurant_table:
            return {"error": "Invalid restaurant_table_id"}, 400

        # Combine the date and time to create the full timestamp
        try:
            reservation_datetime = datetime.strptime(f"{reservation_date} {reservation_time}", '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return {"error": "Invalid date or time format. Please use 'YYYY-MM-DD' for date and 'HH:MM:SS' for time."}, 400

        try:
            new_reservation = reservation_association.insert().values(
                client_id=client_id,
                restaurant_table_id=restaurant_table_id,
                date=reservation_date,
                time=reservation_time,
                timestamp=reservation_datetime
            )
            db.session.execute(new_reservation)
            db.session.commit()

            return {"message": "Reservation created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    # Update an existing reservation
    def patch(self, client_id):
        data = request.get_json()

        if not client_id:
            return {"error": "client_id is required"}, 400

        reservation = db.session.execute(
            select(reservation_association).where(reservation_association.c.client_id == client_id)
        ).fetchone()

        if not reservation:
            return {"error": "No reservation found for this client"}, 404

        update_data = {}

        # Check if restaurant_table_id is being updated
        if "restaurant_table_id" in data:
            restaurant_table = RestaurantTable.query.get(data["restaurant_table_id"])
            if not restaurant_table:
                return {"error": "Invalid restaurant_table_id"}, 400
            update_data["restaurant_table_id"] = data["restaurant_table_id"]

        # Check if reservation date is being updated
        if "reservation_date" in data:
            update_data["date"] = data["reservation_date"]

        # Check if reservation time is being updated
        if "reservation_time" in data:
            try:
                reservation_datetime = datetime.strptime(f"{update_data.get('date', reservation.date)} {data['reservation_time']}", '%Y-%m-%d %H:%M:%S')
                update_data["time"] = data["reservation_time"]
                update_data["timestamp"] = reservation_datetime
            except ValueError:
                return {"error": "Invalid time format. Please use 'HH:MM:SS'."}, 400

        if update_data:
            try:
                db.session.execute(
                    reservation_association.update()
                    .where(reservation_association.c.client_id == client_id)
                    .values(update_data)
                )
                db.session.commit()
                return {"message": "Reservation updated successfully"}, 200
            except Exception as e:
                db.session.rollback()
                return {"error": str(e)}, 500

        return {"message": "No updates provided"}, 400

    # Delete a reservation (by client_id)
    def delete(self, client_id):
        if not client_id:
            return {"error": "client_id is required"}, 400

        reservation = db.session.execute(
            select(reservation_association).where(reservation_association.c.client_id == client_id)
        ).fetchone()

        if not reservation:
            return {"error": "No reservation found for this client"}, 404

        try:
            db.session.execute(
                delete(reservation_association).where(reservation_association.c.client_id == client_id)
            )
            db.session.commit()
            return {"message": "Reservation deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

api.add_resource(ReservationResource, '/reservations', '/reservations/<int:client_id>')

class RestaurantTableResource(Resource):
    # GET - Retrieve all restaurant tables
    def get(self):
        tables = RestaurantTable.query.all()

        if not tables:
            return {"error": "No tables found"}, 404

        tables_list = []
        for table in tables:
            tables_list.append({
                "id": table.id,
                "table_number": table.table_number,
                "capacity": table.capacity,
                "admin": table.admin
            })

        return {"tables": tables_list}, 200

    # POST - Create a new restaurant table
    def post(self):
        data = request.get_json()

        if not data or not data.get('table_number') or not data.get('capacity') or not data.get('admin'):
            return {"error": "Missing required fields"}, 400

        try:
            new_table = RestaurantTable(
                table_number=data['table_number'],
                capacity=data['capacity'],
                admin=data['admin']
            )

            db.session.add(new_table)
            db.session.commit()
            return {"message": "Restaurant table created", "id": new_table.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    # PATCH - Update a restaurant table's details
    def patch(self, table_id):
        data = request.get_json()

        table = RestaurantTable.query.get(table_id)
        if not table:
            return {"error": "Table not found"}, 404

        if "table_number" in data:
            table.table_number = data["table_number"]

        if "capacity" in data:
            table.capacity = data["capacity"]

        if "admin" in data:
            table.admin = data["admin"]

        try:
            db.session.commit()
            return {"message": "Restaurant table updated"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    def delete(self, table_id):
        table = RestaurantTable.query.get(table_id)
        if not table:
            return {"error": "Table not found"}, 404

        try:
            db.session.delete(table)
            db.session.commit()
            return {"message": "Restaurant table deleted"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

api.add_resource(RestaurantTableResource, 
                 '/restaurant_tables', 
                 '/restaurant_tables/<int:table_id>')





if __name__ == "__main__":
    app.run(debug=True, port=5555)
