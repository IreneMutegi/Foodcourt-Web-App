from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from models import db, Admin, Client, Restaurant, Menu, orders_association

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://irene:password@localhost/myappdb'
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
            
            # Seeding Clients
            client1 = Client.query.filter_by(email='john@example.com').first()
            client2 = Client.query.filter_by(email='jane@example.com').first()
            if not client1:
                client1 = Client(name='John Doe', email='john@example.com', password='password123')
                client2 = Client(name='Jane Smith', email='jane@example.com', password='password456')
                db.session.add_all([client1, client2])
                db.session.commit()

            # Seeding Restaurants
            restaurant1 = Restaurant.query.filter_by(email='italian@example.com').first()
            restaurant2 = Restaurant.query.filter_by(email='sushi@example.com').first()
            if not restaurant1:
                restaurant1 = Restaurant(name='Italian Delight', cuisine='Italian', email='italian@example.com', password='restopass', admin_id=admin1.id)
                restaurant2 = Restaurant(name='Sushi Place', cuisine='Japanese', email='sushi@example.com', password='restopass2', admin_id=admin1.id)
                db.session.add_all([restaurant1, restaurant2])
                db.session.commit()

            # Seeding Menu Items
            menu1 = Menu.query.filter_by(name='Pasta Carbonara').first()
            menu2 = Menu.query.filter_by(name='Sushi Roll').first()
            if not menu1:
                menu1 = Menu(name='Pasta Carbonara', price=15, cuisine='Italian', category='Main Course', restaurant_id=restaurant1.id)
                menu2 = Menu(name='Sushi Roll', price=12, cuisine='Japanese', category='Appetizer', restaurant_id=restaurant2.id)
                db.session.add_all([menu1, menu2])
                db.session.commit()

            # Seeding Orders (Ensure no duplicate orders are added)
            existing_orders = db.session.execute(
                orders_association.select().where(
                    (orders_association.c.client_id == client1.id) &
                    (orders_association.c.restaurant_id == restaurant1.id)
                )
            ).fetchall()

            if not existing_orders:
                order1 = orders_association.insert().values(client_id=client1.id, restaurant_id=restaurant1.id, table_number=5, quantity=2)
                order2 = orders_association.insert().values(client_id=client2.id, restaurant_id=restaurant2.id, table_number=3, quantity=1)

                db.session.execute(order1)
                db.session.execute(order2)
                db.session.commit()
                print("✅ Orders seeded successfully!")
            else:
                print("⚠️ Orders already exist. Skipping order seeding.")
            
            print("Seeding completed successfully!")
        
        except IntegrityError:
            db.session.rollback()
            print(" Error: Integrity constraint violation. Rolling back.")

if __name__ == '__main__':
    seed_data()
