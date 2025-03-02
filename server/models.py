from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, Table, Column, Integer, String, ForeignKey, DateTime, Date, Time
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

metadata = MetaData(naming_convention={ 
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s", 
})

db = SQLAlchemy(metadata=metadata)

# Reservation Association Table
reservation_association = Table(
    'reservation',
    metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),  # Primary key
    Column('restaurant_table_id', Integer, ForeignKey('restaurant_tables.id'), nullable=False),
    Column('client_id', Integer, ForeignKey('client.id'), nullable=False),
    Column('date', Date, nullable=False),
    Column('time', Time, nullable=False),
    Column('timestamp', DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
)

# Orders Association Table
orders_association = Table(
    'orders',
    metadata,  
    Column('id', Integer, primary_key=True, autoincrement=True), 
    Column('reservation_id', Integer, ForeignKey('reservation.id'), nullable=False),  
    Column('restaurant_table_id', Integer, ForeignKey('restaurant_tables.id'), nullable=False),
    Column('client_id', Integer, ForeignKey('client.id'), nullable=False),
    Column('restaurant_id', Integer, ForeignKey('restaurants.id'), nullable=False),
    Column('meal_id', Integer, ForeignKey('menu.id'), nullable=False),
    Column('quantity', Integer, nullable=False),
    Column('price', Integer, nullable=False),
    Column('total', Integer, nullable=False),
    Column('timestamp', DateTime, nullable=False),
    Column('status', String(50), nullable=False)  # Booking status (e.g., "Confirmed", "Pending")
)

# Admin Model
class Admin(db.Model):  
    _tablename_ = 'admin'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)

    restaurants = relationship('Restaurant', back_populates='admin')

    def _repr_(self):
        return f'<Admin {self.id}, {self.name}, {self.email}>'

# Client Model
class Client(db.Model):  
    _tablename_ = 'client'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)

    reservations = relationship('RestaurantTable', secondary=reservation_association, back_populates="clients")

    def _repr_(self):  
        return f'<Client {self.id}, {self.name}, {self.email}>'

# Restaurant Model
class Restaurant(db.Model):  
    _tablename_ = 'restaurants'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    cuisine = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    admin_id = Column(Integer, ForeignKey('admin.id'), nullable=False)
    image_url= Column(String, nullable=False)

    admin = relationship('Admin', back_populates='restaurants')
    menus = relationship('Menu', back_populates='restaurant')

    def _repr_(self):
        return f'<Restaurant {self.id}, {self.name}, {self.cuisine}>'

# Menu Model
class Menu(db.Model):  
    _tablename_ = 'menu'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False)
    image_url = Column(String, nullable=False)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=False)

    restaurant = relationship('Restaurant', back_populates='menus')

    def _repr_(self):
        return f'<Menu {self.id}, {self.name}, {self.category}>'

# RestaurantTable Model
class RestaurantTable(db.Model):  
    _tablename_ = 'restaurant_tables'
    id = Column(Integer, primary_key=True)
    table_number = Column(String(50), nullable=False)
    capacity = Column(Integer, nullable=False)
    admin = Column(String(100), nullable=False)

    clients = relationship('Client', secondary=reservation_association, back_populates="reservations")

    def _repr_(self):
        return f'<RestaurantTable {self.id}, {self.table_number}, {self.capacity}>'
