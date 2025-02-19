from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, Column, Integer, String, ForeignKey, Table

# Metadata (important for naming conventions)
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy(metadata=metadata)

class Admin(db.Model):  
    __tablename__ = 'admin'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    restaurants = db.relationship('Restaurant', back_populates='admin')

    def __repr__(self):
        return f'<Admin {self.id}, {self.name}, {self.email}>'

class Client(db.Model):  
    __tablename__ = 'clients'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), unique=True, nullable=False)
    orders = db.relationship('Order', back_populates='client')

    def __repr__(self):
        return f'<Client {self.id}, {self.name}, {self.email}>'

class Restaurant(db.Model):  
    __tablename__ = 'restaurants'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    cuisine = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), unique=True, nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)
    image_url = db.Column(db.String, nullable=True)
    menu_id = db.Column(db.Integer, db.ForeignKey('menu.id'), nullable=True) 
    menu = db.relationship('Menu', back_populates='restaurant', uselist=False)  
    orders = db.relationship('Order', back_populates='restaurant')
    admin = db.relationship('Admin', back_populates='restaurants')

    def __repr__(self):
        return f'<Restaurant {self.id}, {self.name}, {self.cuisine}, Image: {self.image_url}>'

class Menu(db.Model):  
    __tablename__ = 'menu'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String, nullable=True)
    category = db.Column(db.String(100), nullable=False)
    
    restaurant = db.relationship('Restaurant', back_populates='menu', uselist=False)  

    def __repr__(self):
        return f'<Menu {self.id}, {self.name}, {self.price}, Image: {self.image_url}>'

class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    client_id = db.Column(db.Integer, db.ForeignKey("clients.id"), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey("restaurants.id"), nullable=False)
    table_number = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    
    client = db.relationship("Client", back_populates="orders")
    restaurant = db.relationship("Restaurant", back_populates="orders")

    def __repr__(self):
        return f'<Order {self.id}, Client {self.client_id}, Restaurant {self.restaurant_id}, Table {self.table_number}, Quantity {self.quantity}>'

    
    
    