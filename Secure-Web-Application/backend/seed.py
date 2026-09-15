from app import create_app
from database import db
from models import User, AuditLog, Alert
from auth import bcrypt

app = create_app()

def seed_database():
    with app.app_context():
        print("Checking for existing users...")
        
        # Admin account
        admin = User.query.filter_by(email='admin@securevault.local').first()
        if not admin:
            admin_pass = bcrypt.generate_password_hash('Admin@12345').decode('utf-8')
            admin = User(username='admin_sys', email='admin@securevault.local', password_hash=admin_pass, role='ADMIN')
            db.session.add(admin)
            print("Created ADMIN: admin@securevault.local")
        else:
            print("ADMIN already exists.")
            
        # User account
        user = User.query.filter_by(email='user@securevault.local').first()
        if not user:
            user_pass = bcrypt.generate_password_hash('User@12345').decode('utf-8')
            user = User(username='user_sys', email='user@securevault.local', password_hash=user_pass, role='USER')
            db.session.add(user)
            print("Created USER: user@securevault.local")
        else:
            print("USER already exists.")

        db.session.commit()
        print("Demo data successfully seeded (without destroying existing logs)!")
        print("--- Credentials ---")
        print("Admin: admin@securevault.local / Admin@12345")
        print("User: user@securevault.local / User@12345")

if __name__ == '__main__':
    seed_database()
