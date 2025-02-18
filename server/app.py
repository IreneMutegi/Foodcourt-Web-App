from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db, Admin, Client, Restaurant, Menu, orders_association

app = Flask(__name__)

# PostgreSQL URI configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://irene:password@localhost:5432/myappdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'

# Initialize the database
db.init_app(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)

# Route to welcome the user
@app.route('/')
def welcome():
    return "Welcome to the Foodcourt Web App!"

if __name__ == '__main__':
    app.run(port=5555)
