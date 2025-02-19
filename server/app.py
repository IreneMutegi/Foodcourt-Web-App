from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db, Admin, Client, Restaurant, Menu, orders_association

app = Flask(__name__)

# PostgreSQL URI configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://irene:password@localhost:5432/malldb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'

db.init_app(app)

migrate = Migrate(app, db)

@app.route('/')
def welcome():
    return "Welcome to the Foodcourt Web App!"

if __name__ == '__main__':
    app.run(port=5555)
