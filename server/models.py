from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, Column, Integer, String, ForeignKey, Table

# Metadata (important for naming conventions)
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy(metadata=metadata)

orders_association = Table(
    'orders', 
    db.Model.metadata, 
    Column('id', Integer, primary_key=True,), 
    Column('client_id', Integer, ForeignKey('client.id'), primary_key=True),
    Column('restaurant_id', Integer, ForeignKey('restaurants.id'), primary_key=True),
    Column('table_number', Integer, nullable=False),
    Column('quantity', Integer, nullable=False)
)

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
    __tablename__ = 'client'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), unique=True, nullable=False)
    restaurants = db.relationship('Restaurant', secondary=orders_association, back_populates='clients')

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
    clients = db.relationship('Client', secondary=orders_association, back_populates='restaurants')
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