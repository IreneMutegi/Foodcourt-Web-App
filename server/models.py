from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, Table, Column, Integer, String, ForeignKey

# Define metadata with naming convention
metadata = MetaData(naming_convention={ 
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s", 
})

db = SQLAlchemy(metadata=metadata)

# Association Table for Orders
orders_association = Table(
    'orders',
    metadata,  
    Column('client_id', Integer, ForeignKey('client.id'), primary_key=True),
    Column('restaurant_id', Integer, ForeignKey('restaurants.id'), primary_key=True),
    Column('meal_id', Integer, ForeignKey('menu.id'), primary_key=True),
    Column('table_number', Integer, nullable=False),
    Column('quantity', Integer, nullable=False),
    Column('price', Integer, nullable=False),
    Column('total', Integer, nullable=False)
)

# Admin Model
class Admin(db.Model):  
    __tablename__ = 'admin'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)

    restaurants = db.relationship('Restaurant', back_populates='admin')

    def __repr__(self):
        return f'<Admin {self.id}, {self.name}, {self.email}>'

# Client Model
class Client(db.Model):  
    __tablename__ = 'client'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)

    restaurants = db.relationship('Restaurant', secondary=orders_association, back_populates='clients')

    def __repr__(self):  
        return f'<Client {self.id}, {self.name}, {self.email}>'

# Restaurant Model
class Restaurant(db.Model):  
    __tablename__ = 'restaurants'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    cuisine = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    admin_id = Column(Integer, ForeignKey('admin.id'), nullable=False)
    image_url = Column(String, nullable=True)

    menu_items = db.relationship('Menu', back_populates='restaurant')
    clients = db.relationship('Client', secondary=orders_association, back_populates='restaurants')
    admin = db.relationship('Admin', back_populates='restaurants')

# Menu Model
class Menu(db.Model):  
    __tablename__ = 'menu'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False)
    image_url = Column(String, nullable=True)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=False)

    restaurant = db.relationship('Restaurant', back_populates='menu_items')
