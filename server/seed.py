from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from models import db, Admin, Client, Restaurant, Menu, orders_association

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://cullen:kaberere@localhost/malldb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def seed_data():
    with app.app_context():
        db.create_all()

        try:
            # Seeding Admins
            admin1 = Admin.query.filter_by(email='admin1@example.com').first()
            if not admin1:
                admin1 = Admin(name='Admin One', email='admin1@example.com', password='securepassword1')
                db.session.add(admin1)
                db.session.commit()
                print("Admin seeded.")

            # Seeding Clients
            client1 = Client.query.filter_by(email='john@example.com').first()
            client2 = Client.query.filter_by(email='faith@example.com').first()
            if not client1:
                client1 = Client(name='John Omondi', email='john@example.com', password='password123')
                db.session.add(client1)
            if not client2:
                client2 = Client(name='Faith Wanjiru', email='faith@example.com', password='password456')
                db.session.add(client2)
            db.session.commit()
            print("Clients seeded.")

            # Seeding Restaurants
            restaurant1 = Restaurant.query.filter_by(email='nigerian@example.com').first()
            restaurant2 = Restaurant.query.filter_by(email='chinese@example.com').first()
            if not restaurant1:
                restaurant1 = Restaurant(name='Nigeria Delight', cuisine='Nigerian', email='nigerian@example.com', password='restopass', admin_id=admin1.id)
                db.session.add(restaurant1)
            if not restaurant2:
                restaurant2 = Restaurant(name='Chinese Place', cuisine='Chinese', email='chinese@example.com', password='restopass2', admin_id=admin1.id)
                db.session.add(restaurant2)
            db.session.commit()
            print("Restaurants seeded.")

            # Seeding Menu Items
            menu1 = Menu.query.filter_by(name='Pasta Carbonara').first()
            menu2 = Menu.query.filter_by(name='Sushi Roll').first()
            if not menu1:
                menu1 = Menu(name='Pasta Carbonara', price=15, category='Main Course', restaurant=restaurant1)
                db.session.add(menu1)
            if not menu2:
                menu2 = Menu(name='Sushi Roll', price=12, category='Appetizer', restaurant=restaurant2)
                db.session.add(menu2)
            db.session.commit()
            print("Menus seeded.")

            # Seeding Orders (Prevent Duplicates)
            order_exists = db.session.execute(
                orders_association.select().where(
                    (orders_association.c.client_id == client1.id) & 
                    (orders_association.c.restaurant_id == restaurant1.id)
                )
            ).fetchone()

            if not order_exists:
                db.session.execute(orders_association.insert().values(client_id=client1.id, restaurant_id=restaurant1.id, table_number=5, quantity=2))
                db.session.execute(orders_association.insert().values(client_id=client2.id, restaurant_id=restaurant2.id, table_number=3, quantity=1))
                db.session.commit()
                print("Orders seeded.")
            else:
                print("Orders already exist. Skipping order seeding.")

            print("Seeding completed successfully.")
        
        except IntegrityError as e:
            db.session.rollback()
            print(f"Error: Integrity constraint violation. Rolling back. Details: {e}")

if __name__ == '__main__':
    seed_data()
