from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, Table, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

# Define metadata with naming convention
metadata = MetaData(naming_convention={ 
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s", 
})

db = SQLAlchemy(metadata=metadata)

#
# Orders Association Table
orders_association = Table(
    'orders',
    metadata,  
    # Use the two foreign key columns from the reservation_association
    Column('restaurant_table_id', Integer, ForeignKey('reservation.restaurant_table_id'), primary_key=True),
    Column('client_id', Integer, ForeignKey('reservation.client_id'), primary_key=True),
    Column('restaurant_id', Integer, ForeignKey('restaurants.id'), primary_key=True),  
    Column('meal_id', Integer, ForeignKey('menu.id'), primary_key=True),  
    Column('quantity', Integer, nullable=False),
    Column('price', Integer, nullable=False),
    Column('total', Integer, nullable=False),
    Column('timestamp', DateTime, nullable=False),
    db.CheckConstraint(
        'meal_id IN (SELECT id FROM menu WHERE restaurant_id = restaurant_id)', 
        name='fk_meal_restaurant'
    )
)


# Reservation Association Table
reservation_association = Table(
    'reservation',
    metadata,  
    Column('restaurant_table_id', Integer, ForeignKey('restaurant_tables.id'), primary_key=True),
    Column('client_id', Integer, ForeignKey('client.id'), primary_key=True),
    Column('date', DateTime, nullable=False),
    Column('timestamp', DateTime, nullable=False)
)

# Admin Model
class Admin(db.Model):  
    __tablename__ = 'admin'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)

    restaurants = relationship('Restaurant', back_populates='admin')

    def __repr__(self):
        return f'<Admin {self.id}, {self.name}, {self.email}>'

# Client Model
class Client(db.Model):  
    __tablename__ = 'client'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)

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
    image_url= Column(String, nullable=False)

    admin = relationship('Admin', back_populates='restaurants')
    menus = relationship('Menu', back_populates='restaurant')  


class Menu(db.Model):  
    __tablename__ = 'menu'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False)
    image_url= Column(String, nullable=False)
    restaurant_id = Column(Integer, ForeignKey('restaurants.id'), nullable=False)  

    restaurant = relationship('Restaurant', back_populates='menus')


class RestaurantTable(db.Model):  
    __tablename__ = 'restaurant_tables'
    id = Column(Integer, primary_key=True)
    table_number = Column(String(50), nullable=False)
    capacity = Column(Integer, nullable=False)
    admin = Column(String(100), nullable=False)

   
