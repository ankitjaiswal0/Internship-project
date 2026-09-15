from app import create_app
from database import db
from models import User

app = create_app()
with app.app_context():
    users = User.query.all()
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}, Hash: {u.password_hash[:15]}...")
