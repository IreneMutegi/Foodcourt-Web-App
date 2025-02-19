from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db  # Import db instance from models.py

app = Flask(__name__)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://cullen:kaberere@localhost:5432/malldb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'

db.init_app(app)

migrate = Migrate(app, db)

@app.route('/')
def welcome():
    return "Welcome to the Foodcourt Web App!"

if __name__ == '__main__':
    app.run(port=5555)
