from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, Table, Column, Integer, String, ForeignKey

metadata = MetaData(naming_convention={ 
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s", 
})

db = SQLAlchemy(metadata=metadata)

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
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

    restaurants = db.relationship('Restaurant', back_populates='admin')

    def __repr__(self):
        return f'<Admin {self.id}, {self.name}, {self.email}>'

class Client(db.Model):  
    __tablename__ = 'client'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

    restaurants = db.relationship('Restaurant', secondary=orders_association, back_populates='clients')

    def __repr__(self):  
        return f'<Client {self.id}, {self.name}, {self.email}>'

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, Column, Integer, String, ForeignKey, Table

metadata = MetaData(naming_convention={ 
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s", 
})

db = SQLAlchemy(metadata=metadata)

orders_association = db.Table(
    'orders',
    db.Model.metadata,
    db.Column('client_id', db.Integer, db.ForeignKey('client.id'), primary_key=True),
    db.Column('restaurant_id', db.Integer, db.ForeignKey('restaurants.id'), primary_key=True),
    db.Column('meal_id', db.Integer, db.ForeignKey('menu.id'), primary_key=True),
    db.Column('table_number', db.Integer, nullable=False),
    db.Column('quantity', db.Integer, nullable=False),
    db.Column('price', db.Integer, nullable=False),
    db.Column('total', db.Integer, nullable=False)
)

class Admin(db.Model):  
    __tablename__ = 'admin'  
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    restaurants = db.relationship('Restaurant', back_populates='admin')

class Client(db.Model):  
    __tablename__ = 'client'  
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    restaurants = db.relationship('Restaurant', secondary='orders', back_populates='clients')

class Restaurant(db.Model):  
    __tablename__ = 'restaurants'  
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    cuisine = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)
    image_url = db.Column(db.String, nullable=True)
    
    menu_items = db.relationship('Menu', back_populates='restaurant', foreign_keys='[Menu.restaurant_id]')  

    clients = db.relationship('Client', secondary='orders', back_populates='restaurants')
    admin = db.relationship('Admin', back_populates='restaurants')

class Menu(db.Model):  
    __tablename__ = 'menu'  
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String, nullable=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)  
    
    restaurant = db.relationship('Restaurant', back_populates='menu_items', foreign_keys=[restaurant_id])  

