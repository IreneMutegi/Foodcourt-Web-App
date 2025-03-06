from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
from flask_migrate import Migrate
from server.models import db, Client, Admin, Restaurant, Menu, orders_association, reservation_association ,RestaurantTable
from sqlalchemy import select, delete,update 
from datetime import datetime, date, time , timedelta, timezone
import os
from sqlalchemy.exc import SQLAlchemyError


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'postgresql://malldb_u5p5_user:A5tnGchdaALQQYm2ylzxnT73oenbwn77@dpg-cusvqnbqf0us739q23rg-a.oregon-postgres.render.com/malldb_u5p5')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
api = Api(app)
migrate = Migrate(app, db)
CORS(app, supports_credentials=True, methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"])

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

        db.session.execute(
            orders_association.delete().where(orders_association.c.meal_id.in_(
            db.session.query(Menu.id).filter(Menu.restaurant_id == restaurant_id)
        ))
    )

        Menu.query.filter_by(restaurant_id=restaurant_id).delete()

        db.session.delete(restaurant)
        db.session.commit()

        return {"message": "Restaurant and its menu items deleted successfully"}, 200




api.add_resource(
    RestaurantResource,
    '/restaurants',
    '/restaurants/<int:restaurant_id>',
    '/restaurants/name/<string:name>',
    '/restaurants/cuisine/<string:cuisine>'
)



class MenuResource(Resource):
    def get(self, restaurant_id, meal_id=None):
        if meal_id:
            meal = Menu.query.filter_by(id=meal_id, restaurant_id=restaurant_id).first()
            if not meal:
                return {"error": "Meal not found"}, 404

            return {
                "id": meal.id,
                "name": meal.name,
                "category": meal.category,
                "price": meal.price,
                "image_url": meal.image_url
            }, 200
        else:
            meals = Menu.query.filter_by(restaurant_id=restaurant_id).all()
            if not meals:
                return {"error": "No meals found for this restaurant"}, 404

            meal_list = [
                {"id": m.id, "name": m.name, "category": m.category, "price": m.price, "image_url": m.image_url}
                for m in meals
            ]
            return {"meals": meal_list}, 200

    def post(self, restaurant_id):
        data = request.get_json()
        name = data.get('name')
        category = data.get('category')
        price = data.get('price')
        image_url = data.get('image_url')

        if not name or not category or not price or not image_url:
            return {"error": "Missing required fields"}, 400

        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            return {"error": "Restaurant not found"}, 404

        meal = Menu(name=name, category=category, price=price, image_url=image_url, restaurant_id=restaurant_id)
        db.session.add(meal)
        db.session.commit()

        return {"message": "Meal added successfully", "id": meal.id}, 201

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

        # Delete all orders linked to this meal
        db.session.execute(
            orders_association.delete().where(orders_association.c.meal_id == meal_id)
        )

        db.session.delete(meal)
        db.session.commit()
        return {"message": "Meal deleted successfully"}, 200

# Update routes to support both meal-specific and restaurant-specific actions
api.add_resource(
    MenuResource,
    '/menu/restaurant/<int:restaurant_id>/meal/<int:meal_id>',
    '/menu/restaurant/<int:restaurant_id>'
)



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
    def get(self, client_id=None, order_id=None):
        query = select(
            orders_association.c.id,
            orders_association.c.client_id,
            orders_association.c.reservation_id,
            orders_association.c.restaurant_id,
            orders_association.c.meal_id,
            orders_association.c.quantity,
            orders_association.c.price,
            orders_association.c.total,
            orders_association.c.status
        )

        if client_id and order_id:
            query = query.where(orders_association.c.client_id == client_id)
            query = query.where(orders_association.c.id == order_id)
        elif client_id:
            query = query.where(orders_association.c.client_id == client_id)
        elif order_id:
            query = query.where(orders_association.c.id == order_id)

        orders = db.session.execute(query).fetchall()

        if not orders:
            return {"message": "No orders found"}, 404

        orders_list = []
        for order in orders:
            order_id, client_id, reservation_id, restaurant_id, meal_id, quantity, price, total, status = order

            meal = Menu.query.get(meal_id)
            client = Client.query.get(client_id)
            restaurant = Restaurant.query.get(restaurant_id)

            orders_list.append({
                "order_id": order_id,
                "client_id": client_id,
                "client_name": client.name if client else "Unknown Client",
                "reservation_id": reservation_id,
                "restaurant_id": restaurant_id,
                "restaurant_name": restaurant.name if restaurant else "Unknown Restaurant",
                "meal_id": meal_id,
                "meal_name": meal.name if meal else "Unknown Meal",
                "category": meal.category if meal else "Unknown Category",
                "quantity": quantity,
                "price": price,
                "total": total,
                "status": status,
                "image_url": meal.image_url if meal else None
            })

        return {"orders": orders_list}, 200

    def post(self):
        data = request.get_json()
        
        client_id = data.get("client_id")
        restaurant_id = data.get("restaurant_id")
        meal_id = data.get("meal_id")
        quantity = data.get("quantity")
        reservation_id = data.get("reservation_id")
        status = data.get("status", "Pending")

        if not all([client_id, restaurant_id, meal_id, quantity, reservation_id]):
            return {"error": "All fields are required except restaurant_table_id"}, 400

        meal = Menu.query.get(meal_id)
        if not meal:
            return {"error": "Invalid meal_id"}, 400

        price = meal.price
        total = price * quantity
        
        try:
            new_order = orders_association.insert().values(
                client_id=client_id,
                restaurant_id=restaurant_id,
                meal_id=meal_id,
                quantity=quantity,
                price=price,
                total=total,
                reservation_id=reservation_id,
                status=status
            )
            db.session.execute(new_order)
            db.session.commit()

            return {"message": "Order created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    def patch(self, order_id):
        data = request.get_json()
        
        if not order_id:
            return {"error": "order_id is required"}, 400

        order = db.session.execute(
            select(orders_association).where(orders_association.c.id == order_id)
        ).fetchone()

        if not order:
            return {"error": "No order found for this ID"}, 404

        update_data = {}

        if "meal_id" in data:
            meal = Menu.query.get(data["meal_id"])
            if not meal:
                return {"error": "Invalid meal_id"}, 400
            update_data["meal_id"] = data["meal_id"]
            update_data["price"] = meal.price  

        if "quantity" in data:
            update_data["quantity"] = data["quantity"]
            update_data["total"] = update_data.get("price", order.price) * data["quantity"]

        if "status" in data:
            update_data["status"] = data["status"]

        if update_data:
            try:
                db.session.execute(
                    orders_association.update()
                    .where(orders_association.c.id == order_id)
                    .values(update_data)
                )
                db.session.commit()
                return {"message": "Order updated successfully"}, 200
            except Exception as e:
                db.session.rollback()
                return {"error": str(e)}, 500

        return {"message": "No updates provided"}, 400

    def delete(self, order_id):
        if not order_id:
            return {"error": "order_id is required"}, 400

        order = db.session.execute(
            select(orders_association).where(orders_association.c.id == order_id)
        ).fetchone()

        if not order:
            return {"error": "No order found for this ID"}, 404

        try:
            db.session.execute(
                delete(orders_association).where(orders_association.c.id == order_id)
            )
            db.session.commit()
            return {"message": "Order deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500


# Register the resource with the API
api.add_resource(OrdersResource, 
                 '/orders', 
                 '/orders/<int:client_id>', 
                 '/orders/id/<int:order_id>', 
                 '/orders/<int:client_id>/<int:order_id>')








class RestaurantOrderResource(Resource):
    def get(self, restaurant_id=None, client_id=None, order_id=None):
        try:
            if order_id:  # Fetch a specific order
                order = db.session.execute(
                    select(
                        orders_association.c.client_id,
                        orders_association.c.meal_id,
                        orders_association.c.quantity,
                        orders_association.c.price,
                        orders_association.c.status,
                        orders_association.c.timestamp,
                        reservation_association.c.restaurant_table_id  # Reference table via reservation_id
                    )
                    .join(reservation_association, orders_association.c.reservation_id == reservation_association.c.id)
                    .where(orders_association.c.id == order_id)
                ).fetchone()

                if not order:
                    return {"error": "Order not found"}, 404

                client_id = order[0]
                meal_id = order[1]
                quantity = order[2]
                price = order[3]
                status = order[4]
                timestamp = order[5]
                restaurant_table_id = order[6]

                table = db.session.execute(
                    select(RestaurantTable.table_number)
                    .where(RestaurantTable.id == restaurant_table_id)
                ).fetchone()

                table_number = table[0] if table else "Unknown Table"

                meal = Menu.query.get(meal_id)
                client = Client.query.get(client_id)

                order_details = {
                    "client_id": client_id,
                    "client_name": client.name if client else "Unknown Client",
                    "meal_id": meal_id,
                    "meal_name": meal.name if meal else "Unknown Meal",
                    "category": meal.category if meal else "Unknown Category",
                    "table_number": table_number,
                    "quantity": quantity,
                    "price": price,
                    "total": price * quantity,
                    "status": status,
                    "timestamp": timestamp.isoformat() if timestamp else None
                }

                return {"order": order_details}, 200

            else:  
                orders = db.session.execute(
                    select(
                        orders_association.c.id,
                        orders_association.c.client_id,
                        orders_association.c.meal_id,
                        orders_association.c.quantity,
                        orders_association.c.price,
                        orders_association.c.status,
                        orders_association.c.timestamp,
                        reservation_association.c.restaurant_table_id
                    )
                    .join(reservation_association, orders_association.c.reservation_id == reservation_association.c.id)
                    .where(orders_association.c.restaurant_id == restaurant_id)
                    .order_by(orders_association.c.timestamp)
                ).fetchall()

                if not orders:
                    return {"error": "No orders found for this restaurant"}, 404

                order_list = []
                for order in orders:
                    order_id, client_id, meal_id, quantity, price, status, timestamp, restaurant_table_id = order

                    table = db.session.execute(
                        select(RestaurantTable.table_number)
                        .where(RestaurantTable.id == restaurant_table_id)
                    ).fetchone()

                    table_number = table[0] if table else "Unknown Table"

                    meal = Menu.query.get(meal_id)
                    client = Client.query.get(client_id)

                    order_list.append({
                        "order_id": order_id,
                        "client_name": client.name if client else "Unknown Client",
                        "meal_name": meal.name if meal else "Unknown Meal",
                        "table_number": table_number,
                        "quantity": quantity,
                        "price": price,
                        "total": price * quantity,
                        "status": status,
                        "timestamp": timestamp.isoformat() if timestamp else None
                    })

                return {"orders": order_list}, 200

        except Exception as e:
            db.session.rollback()
            return {"error": f"An error occurred: {str(e)}"}, 500



    # PATCH - Update an order's details
    def patch(self, restaurant_id, order_id):
        order_data = request.get_json()

        # Fetch the existing order
        order = db.session.execute(
            select(orders_association)
            .where(orders_association.c.id == order_id)
            .where(orders_association.c.restaurant_id == restaurant_id)
        ).fetchone()

        if not order:
            return {"error": "Order not found"}, 404

        try:
            if 'quantity' in order_data:
                db.session.execute(
                    orders_association.update()
                    .where(orders_association.c.id == order_id)
                    .where(orders_association.c.restaurant_id == restaurant_id)
                    .values(quantity=order_data['quantity'])
                )
            if 'status' in order_data:
                db.session.execute(
                    orders_association.update()
                    .where(orders_association.c.id == order_id)
                    .where(orders_association.c.restaurant_id == restaurant_id)
                    .values(status=order_data['status'])
                )
            db.session.commit()
            return {"message": "Order updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    def delete(self, restaurant_id, order_id):
        order = db.session.execute(
            select(orders_association)
            .where(orders_association.c.id == order_id)
            .where(orders_association.c.restaurant_id == restaurant_id)
        ).fetchone()

        if not order:
            return {"error": "Order not found"}, 404

        try:
            db.session.execute(
                orders_association.delete()
                .where(orders_association.c.id == order_id)
                .where(orders_association.c.restaurant_id == restaurant_id)
            )
            db.session.commit()
            return {"message": "Order deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500


# Register the resource and the endpoints with the Api object
api.add_resource(RestaurantOrderResource, 
                 '/orders/restaurants/<int:restaurant_id>/order/<int:order_id>',  # Path for single order actions
                 '/orders/restaurants/<int:restaurant_id>/client/<int:client_id>',  # Path for specific client orders
                 '/orders/restaurants/<int:restaurant_id>')  # Path for all orders from a restaurant





class ReservationResource(Resource):
    def get(self, client_id=None, reservation_id=None):
        if reservation_id:
            reservation = db.session.execute(
                select(
                    reservation_association.c.id,
                    reservation_association.c.client_id,
                    reservation_association.c.restaurant_table_id,
                    reservation_association.c.date,
                    reservation_association.c.time,
                    reservation_association.c.timestamp
                ).where(reservation_association.c.id == reservation_id)
            ).fetchone()

            if not reservation:
                return {"message": "Reservation not found"}, 404

            reservation_id, client_id, restaurant_table_id, reservation_date, reservation_time, timestamp = reservation

            reservation_date_str = reservation_date.isoformat() if isinstance(reservation_date, (date, datetime)) else str(reservation_date)

            reservation_time_str = reservation_time.strftime('%H:%M:%S') if isinstance(reservation_time, time) else str(reservation_time)

            return {
                "reservation_id": reservation_id,
                "client_id": client_id,
                "restaurant_table_id": restaurant_table_id,
                "date": reservation_date_str,
                "time": reservation_time_str,
                "timestamp": timestamp.isoformat() if isinstance(timestamp, (datetime, date)) else str(timestamp)
            }, 200

        elif client_id:
            reservations = db.session.execute(
                select(
                    reservation_association.c.id,
                    reservation_association.c.client_id,
                    reservation_association.c.restaurant_table_id,
                    reservation_association.c.date,
                    reservation_association.c.time,
                    reservation_association.c.timestamp
                ).where(reservation_association.c.client_id == client_id)
            ).fetchall()

        else:
            reservations = db.session.execute(
                select(
                    reservation_association.c.id,
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
            reservation_id, client_id, restaurant_table_id, reservation_date, reservation_time, timestamp = reservation

            reservation_date_str = reservation_date.isoformat() if isinstance(reservation_date, (date, datetime)) else str(reservation_date)

            reservation_time_str = reservation_time.strftime('%H:%M:%S') if isinstance(reservation_time, time) else str(reservation_time)

            reservations_list.append({
                "reservation_id": reservation_id,
                "client_id": client_id,
                "restaurant_table_id": restaurant_table_id,
                "date": reservation_date_str,
                "time": reservation_time_str,
                "timestamp": timestamp.isoformat() if isinstance(timestamp, (datetime, date)) else str(timestamp)
            })

        return {"reservations": reservations_list}, 200


    def post(self):
        data = request.get_json()

        client_id = data.get("client_id")
        restaurant_table_id = data.get("restaurant_table_id")
        reservation_date = data.get("reservation_date")
        reservation_time = data.get("reservation_time")

        if not all([client_id, restaurant_table_id, reservation_date, reservation_time]):
            return {"error": "client_id, restaurant_table_id, reservation_date, and reservation_time are required"}, 400

        client = Client.query.get(client_id)
        if not client:
            return {"error": "Invalid client_id"}, 400

        restaurant_table = RestaurantTable.query.get(restaurant_table_id)
        if not restaurant_table:
            return {"error": "Invalid restaurant_table_id"}, 400

        try:
            reservation_datetime = datetime.strptime(f"{reservation_date} {reservation_time}", '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return {"error": "Invalid date or time format. Please use 'YYYY-MM-DD' for date and 'HH:MM:SS' for time."}, 400

        try:
            result = db.session.execute(
                reservation_association.insert().returning(reservation_association.c.id).values(
                    client_id=client_id,
                    restaurant_table_id=restaurant_table_id,
                    date=reservation_date,
                    time=reservation_time,
                    timestamp=reservation_datetime
                )
            )
            reservation_id = result.fetchone()[0]  # Retrieve the inserted ID
            db.session.commit()

            return {"message": "Reservation created successfully", "id": reservation_id}, 201
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500
    def patch(self, reservation_id):
        data = request.get_json()

        if not reservation_id:
            return {"error": "reservation_id is required"}, 400

        reservation = db.session.execute(
            select(reservation_association).where(reservation_association.c.id == reservation_id)
        ).fetchone()

        if not reservation:
            return {"error": "No reservation found with this id"}, 404

        update_data = {}

        if "restaurant_table_id" in data:
            restaurant_table = RestaurantTable.query.get(data["restaurant_table_id"])
            if not restaurant_table:
                return {"error": "Invalid restaurant_table_id"}, 400
            update_data["restaurant_table_id"] = data["restaurant_table_id"]

        if "reservation_date" in data:
            update_data["date"] = data["reservation_date"]

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
                    .where(reservation_association.c.id == reservation_id)
                    .values(update_data)
                )
                db.session.commit()
                return {"message": "Reservation updated successfully"}, 200
            except SQLAlchemyError as e:
                db.session.rollback()
                return {"error": str(e)}, 500

        return {"message": "No updates provided"}, 400

    def delete(self, reservation_id):
        if not reservation_id:
            return {"error": "reservation_id is required"}, 400

        reservation = db.session.execute(
            select(reservation_association).where(reservation_association.c.id == reservation_id)
        ).fetchone()

        if not reservation:
            return {"error": "No reservation found with this id"}, 404

        try:
            db.session.execute(
                delete(reservation_association).where(reservation_association.c.id == reservation_id)
            )
            db.session.commit()
            return {"message": "Reservation deleted successfully"}, 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500


api.add_resource(ReservationResource, '/reservations', '/reservations/<int:reservation_id>')






from flask import request
from flask_restful import Resource
from models import db, RestaurantTable

class RestaurantTableResource(Resource):
    
    def get(self):
        tables = RestaurantTable.query.all()  # Fetch all tables

        if not tables:
            return {"error": "No tables found"}, 404

        tables_list = []
        for table in tables:
            # Ensure you're getting the latest data from the session
            db.session.refresh(table)  # Force a reload of the table data from the database

            tables_list.append({
                "restaurant_table_id": table.id,
                "table_number": table.table_number,
                "capacity": table.capacity,
                "admin": table.admin,
                "status": table.status  # Reflect the latest status from the database
            })

        return {"tables": tables_list}, 200

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
            return {"message": "Restaurant table created", "restaurant_table_id": new_table.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    def patch(self, table_id):
        data = request.get_json()  # Get the data from the request

        # Debugging: Check incoming request data
        print("Received data:", data)

        table = RestaurantTable.query.get(table_id)  # Find the table by its ID
        if not table:
            return {"error": "Table not found"}, 404  # If table doesn't exist, return error

        # Update table properties based on the provided data
        if "table_number" in data:
            table.table_number = data["table_number"]
        if "capacity" in data:
            table.capacity = data["capacity"]
        if "admin" in data:
            table.admin = data["admin"]
        if "status" in data:
            print(f"Updating status to: {data['status']}")  # Debugging line
            table.status = data["status"]  # Directly update the status

        try:
            db.session.commit()  # Commit changes to the database
            return {"message": "Restaurant table updated successfully"}, 200  # Return success message
        except Exception as e:
            db.session.rollback()  # Rollback changes in case of an error
            return {"error": str(e)}, 500  # Return error message if update fails

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





class ClientReservation(Resource):
    def get(self, client_id=None, reservation_id=None):
        if reservation_id:
            reservation = db.session.execute(
                select(
                    reservation_association.c.id,
                    reservation_association.c.date,
                    reservation_association.c.time,
                    reservation_association.c.timestamp,
                    reservation_association.c.status,
                    RestaurantTable.table_number  # Ensure we get only one table_number for the reservation
                )
                .join(RestaurantTable, RestaurantTable.id == reservation_association.c.restaurant_table_id)  # Join to get the table number
                .where(reservation_association.c.id == reservation_id)
            ).fetchone()

            if not reservation:
                return {"message": "Reservation not found"}, 404

            (reservation_id, reservation_date, reservation_time, timestamp, status, table_number) = reservation

            reservation_date_str = reservation_date.isoformat() if isinstance(reservation_date, (date, datetime)) else str(reservation_date)
            reservation_time_str = reservation_time.strftime('%H:%M:%S') if isinstance(reservation_time, time) else str(reservation_time)
            timestamp_str = timestamp.isoformat() if isinstance(timestamp, (datetime, date)) else str(timestamp)

            return {
                "reservation_id": reservation_id,
                "table_number": table_number,  # Return only the selected table_number
                "date": reservation_date_str,
                "time": reservation_time_str,
                "timestamp": timestamp_str,
                "status": status
            }, 200

        elif client_id:
            reservations = db.session.execute(
                select(
                    reservation_association.c.id,
                    reservation_association.c.date,
                    reservation_association.c.time,
                    reservation_association.c.timestamp,
                    reservation_association.c.status,
                    RestaurantTable.table_number  # Ensure we get only one table_number for the reservation
                )
                .join(RestaurantTable, RestaurantTable.id == reservation_association.c.restaurant_table_id)  # Join to get the table number
                .where(reservation_association.c.client_id == client_id)
            ).fetchall()

        else:
            reservations = db.session.execute(
                select(
                    reservation_association.c.id,
                    reservation_association.c.date,
                    reservation_association.c.time,
                    reservation_association.c.timestamp,
                    reservation_association.c.status,
                    RestaurantTable.table_number  # Ensure we get only one table_number for the reservation
                )
                .join(RestaurantTable, RestaurantTable.id == reservation_association.c.restaurant_table_id)  # Join to get the table number
            ).fetchall()

        if not reservations:
            return {"message": "No reservations found"}, 404

        reservations_list = []
        for reservation in reservations:
            (reservation_id, reservation_date, reservation_time, timestamp, status, table_number) = reservation

            reservation_date_str = reservation_date.isoformat() if isinstance(reservation_date, (date, datetime)) else str(reservation_date)
            reservation_time_str = reservation_time.strftime('%H:%M:%S') if isinstance(reservation_time, time) else str(reservation_time)
            timestamp_str = timestamp.isoformat() if isinstance(timestamp, (datetime, date)) else str(timestamp)

            reservations_list.append({
                "reservation_id": reservation_id,
                "table_number": table_number,  
                "date": reservation_date_str,
                "time": reservation_time_str,
                "timestamp": timestamp_str,
                "status": status
            })

        return {"reservations": reservations_list}, 200


    def patch(self, client_id, reservation_id):
        try:
            data = request.get_json()
            new_status = data.get("status", "Reserved")

            query = update(reservation_association).where(
                reservation_association.c.id == reservation_id,
                reservation_association.c.client_id == client_id
            ).values(status=new_status)

            db.session.execute(query)
            db.session.commit()

            return {"message": "Client reservation status updated successfully"}, 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

api.add_resource(
    ClientReservation, 
    "/reservations/client/<int:client_id>", 
    "/reservations/client/<int:client_id>/<int:reservation_id>"
)


class RestaurantReservation(Resource):
    def get(self, restaurant_id=None, reservation_id=None):
        if reservation_id:
            reservation = db.session.execute(
                select(
                    reservation_association.c.id,
                    Client.name,  # Fetch client name
                    reservation_association.c.restaurant_table_id,
                    reservation_association.c.date,
                    reservation_association.c.time,
                    reservation_association.c.timestamp,
                    reservation_association.c.status  # Include status in the select
                )
                .join(Client, Client.id == reservation_association.c.client_id)  # Join with Client table
                .where(reservation_association.c.id == reservation_id)
            ).fetchone()

            if not reservation:
                return {"message": "Reservation not found"}, 404

            reservation_id, client_name, restaurant_table_id, reservation_date, reservation_time, timestamp, status = reservation

            return {
                "reservation_id": reservation_id,
                "client_name": client_name,  # Return the client name
                "restaurant_table_id": restaurant_table_id,
                "date": reservation_date.isoformat(),
                "time": reservation_time.strftime('%H:%M:%S'),
                "timestamp": timestamp.isoformat(),
                "status": status  # Return the status field
            }, 200

        elif restaurant_id:
            reservations = db.session.execute(
                select(
                    reservation_association.c.id,
                    Client.name,  # Fetch client name
                    reservation_association.c.restaurant_table_id,
                    reservation_association.c.date,
                    reservation_association.c.time,
                    reservation_association.c.timestamp,
                    reservation_association.c.status  # Include status
                )
                .join(Client, Client.id == reservation_association.c.client_id)  # Join with Client table
                .join(orders_association, orders_association.c.reservation_id == reservation_association.c.id)
                .where(orders_association.c.restaurant_id == restaurant_id)  # Filter by restaurant_id from orders_association
            ).fetchall()

            if not reservations:
                return {"message": f"No reservations found for restaurant {restaurant_id}"}, 200

            reservations_list = []
            for reservation in reservations:
                reservation_id, client_name, restaurant_table_id, reservation_date, reservation_time, timestamp, status = reservation

                reservations_list.append({
                    "reservation_id": reservation_id,
                    "client_name": client_name,  # Return the client name
                    "restaurant_table_id": restaurant_table_id,
                    "date": reservation_date.isoformat(),
                    "time": reservation_time.strftime('%H:%M:%S'),
                    "timestamp": timestamp.isoformat(),
                    "status": status  # Return the status for each reservation
                })

            return {"reservations": reservations_list}, 200

        else:
            reservations = db.session.execute(
                select(
                    reservation_association.c.id,
                    Client.name,  # Fetch client name
                    reservation_association.c.restaurant_table_id,
                    reservation_association.c.date,
                    reservation_association.c.time,
                    reservation_association.c.timestamp,
                    reservation_association.c.status  # Include status
                )
                .join(Client, Client.id == reservation_association.c.client_id)  # Join with Client table
            ).fetchall()

            if not reservations:
                return {"message": "No reservations found"}, 404

            reservations_list = []
            for reservation in reservations:
                reservation_id, client_name, restaurant_table_id, reservation_date, reservation_time, timestamp, status = reservation

                reservations_list.append({
                    "reservation_id": reservation_id,
                    "client_name": client_name,  # Return the client name
                    "restaurant_table_id": restaurant_table_id,
                    "date": reservation_date.isoformat(),
                    "time": reservation_time.strftime('%H:%M:%S'),
                    "timestamp": timestamp.isoformat(),
                    "status": status  # Include status in the response
                })

            return {"reservations": reservations_list}, 200

    def patch(self, restaurant_id, reservation_id):
        try:
            data = request.get_json()
            new_status = data.get("status", "Reserved")  # Default to "Reserved" if no status is provided

            existing_reservation = db.session.execute(
                select(reservation_association.c.id)
                .join(orders_association, orders_association.c.reservation_id == reservation_association.c.id)
                .where(
                    reservation_association.c.id == reservation_id,
                    orders_association.c.restaurant_id == restaurant_id
                )
            ).fetchone()

            if not existing_reservation:
                return {"message": "No matching reservation found"}, 404

            query = update(reservation_association).where(reservation_association.c.id == reservation_id).values(status=new_status)
            db.session.execute(query)
            db.session.commit()

            return {"message": "Reservation status updated successfully"}, 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": str(e)}, 500

api.add_resource(
    RestaurantReservation,
    "/reservations/restaurant/<int:restaurant_id>",
    "/reservations/restaurant/<int:restaurant_id>/<int:reservation_id>"
)


    

if __name__ == "_main_":
    app.run(debug=True, port=5555)
