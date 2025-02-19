from flask import Flask
from models import db  # Import SQLAlchemy instance from your models.py

app = Flask(__name__)

# Database Configuration (SQLite for testing, you can use PostgreSQL or MySQL)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()
