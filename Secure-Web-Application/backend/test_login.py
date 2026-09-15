from app import create_app
from database import db
from models import User
from auth import bcrypt

app = create_app()

with app.app_context():
    # 1. Register a new user
    username = 'testbug'
    email = 'testbug@test.local'
    password = 'Password123!'
    
    user = User.query.filter_by(username=username).first()
    if user:
        db.session.delete(user)
        db.session.commit()
    
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()
    print("User registered.")
    
    # 2. Login by username
    login_username = 'testbug'
    db_user_1 = User.query.filter((User.username == login_username) | (User.email == login_username)).first()
    print("Login by username lookup:", db_user_1.username if db_user_1 else "Not found")
    if db_user_1:
        print("Password check 1:", bcrypt.check_password_hash(db_user_1.password_hash, password))
        
    # 3. Login by email
    login_email = 'testbug@test.local'
    db_user_2 = User.query.filter((User.username == login_email) | (User.email == login_email)).first()
    print("Login by email lookup:", db_user_2.username if db_user_2 else "Not found")
    if db_user_2:
        print("Password check 2:", bcrypt.check_password_hash(db_user_2.password_hash, password))

