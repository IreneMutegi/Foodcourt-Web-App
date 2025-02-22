from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
from flask_migrate import Migrate
from server.models import db, Client, Admin, Restaurant, Menu, orders_association  
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'postgresql://irene:password@localhost:5432/malldb')

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
            "user": {"id": user.id, "role": table}
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

class RestaurantList(Resource):
    def get(self):
        restaurants = Restaurant.query.all()
        return jsonify([{
            "id": r.id, "name": r.name, "cuisine": r.cuisine, "email": r.email
        } for r in restaurants]), 200

api.add_resource(RestaurantList, '/restaurants')

class RestaurantUpdate(Resource):
    def patch(self):
        data = request.get_json()

        restaurant_id = data.get('id')
        name = data.get('name')
        cuisine = data.get('cuisine')

        if not restaurant_id:
            return {"error": "Restaurant ID is required for update"}, 400

        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            return {"error": "Restaurant not found"}, 404

        if name:
            restaurant.name = name
        if cuisine:
            restaurant.cuisine = cuisine

        db.session.commit()

        return {"message": "Restaurant updated successfully"}, 200

api.add_resource(RestaurantUpdate, '/restaurants/update')




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

#meal list for a particular restaurant 
class MealList(Resource):
    def get(self, restaurant_id):
        meals = Menu.query.filter_by(restaurant_id=restaurant_id).all()
        if not meals:
            return {"error": "No meals found for this restaurant"}, 404

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
api.add_resource(MealList, '/meals/restaurant/<int:restaurant_id>')  

#for a single meal associated to a restaurant
class Meal(Resource):
    def get(self, restaurant_id, meal_id):
        meal = Menu.query.filter_by(id=meal_id, restaurant_id=restaurant_id).first()
        if not meal:
            return {"error": "Meal not found for this restaurant"}, 404
        return {
            "id": meal.id,
            "name": meal.name,
            "category": meal.category,
            "price": meal.price,
            "image_url": meal.image_url
        }, 200

    def patch(self, restaurant_id, meal_id):
        meal = Menu.query.filter_by(id=meal_id, restaurant_id=restaurant_id).first()
        if not meal:
            return {"error": "Meal not found for this restaurant"}, 404

        data = request.get_json()
        meal.name = data.get('name', meal.name)
        meal.category = data.get('category', meal.category)
        meal.price = data.get('price', meal.price)
        meal.image_url = data.get('image_url', meal.image_url)
        db.session.commit()
        return {"message": "Meal updated successfully"}, 200

    def delete(self, restaurant_id, meal_id):
        meal = Menu.query.filter_by(id=meal_id, restaurant_id=restaurant_id).first()
        if not meal:
            return {"error": "Meal not found for this restaurant"}, 404
        db.session.delete(meal)
        db.session.commit()
        return {"message": "Meal deleted successfully"}, 200
    
api.add_resource(Meal, '/meal/restaurant/<int:restaurant_id>/<int:meal_id>')


class OrderGetById(Resource):
    def get(self, order_id):
        order = db.session.execute(
            orders_association.select().where(
                (orders_association.c.client_id == order_id)
            )
        ).fetchone()

        if not order:
            return {"error": "Order not found"}, 404

        client_id = order[0]
        restaurant_id = order[1]
        meal_id = order[2]
        table_number = order[3]
        quantity = order[4]

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

api.add_resource(OrderGetById, '/orders/<int:order_id>')



class ClientOrderPost(Resource):
    def post(self):
        data = request.get_json()

        client_id = data.get("client_id")
        restaurant_id = data.get("restaurant_id")
        meal_id = data.get("meal_id")
        table_number = data.get("table_number")
        quantity = data.get("quantity")

        if not client_id or not restaurant_id or not meal_id or not table_number or not quantity:
            return {"error": "client_id, restaurant_id, table_number, meal_id, and quantity are required"}, 400

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
                total=total
            )
            db.session.execute(new_order)
            db.session.commit()

            return {"message": "Order created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

api.add_resource(ClientOrderPost, '/orders')


class OrderPatch(Resource):
    def patch(self, order_id):
        order = db.session.execute(
            orders_association.select().where(
                (orders_association.c.client_id == order_id)
            )
        ).fetchone()

        if not order:
            return {"error": "Order not found"}, 404

        client_id = order[0]
        restaurant_id = order[1]
        meal_id = order[2]
        table_number = order[3]
        quantity = order[4]

        meal = Menu.query.get(meal_id)
        client = Client.query.get(client_id)
        restaurant = Restaurant.query.get(restaurant_id)

        data = request.get_json()

        if "table_number" in data:
            table_number = data["table_number"]
        if "quantity" in data:
            quantity = data["quantity"]

        db.session.execute(
            orders_association.update().where(
                (orders_association.c.client_id == client_id) &
                (orders_association.c.restaurant_id == restaurant_id) &
                (orders_association.c.meal_id == meal_id)
            ).values(
                table_number=table_number,
                quantity=quantity
            )
        )
        db.session.commit()

        total = meal.price * quantity if meal else 0

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
            "total": total
        }

        return {"order": order_details}, 200

api.add_resource(OrderPatch, '/orders/patch/<int:order_id>')


class ClientOrderDelete(Resource):
    def delete(self, order_id):
        order = db.session.execute(
            orders_association.select().where(orders_association.c.id == order_id)
        ).fetchone()

        if not order:
            return {"message": "Order not found"}, 404

        db.session.execute(
            orders_association.delete().where(orders_association.c.id == order_id)
        )
        db.session.commit()

        return {"message": "Order deleted successfully"}, 200
api.add_resource(ClientOrderDelete, '/orders/<int:order_id>')



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