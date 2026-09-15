from flask import Flask
from flask_cors import CORS
from database import db
from auth import bcrypt, jwt
from security import limiter, apply_security_headers
from routes import api_bp
from datetime import timedelta
import os

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///securevault.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-super-secret-key-change-in-production')
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_SECURE'] = False # Set to True in production with HTTPS
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True # Enables CSRF protection for cookies
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    
    # CORS setup: allow credentials for cookies
    CORS(app, supports_credentials=True, origins=[os.environ.get('FRONTEND_URL', 'http://localhost:5173'), 'http://localhost:5174'])

    # Apply security headers globally
    @app.after_request
    def after_request(response):
        return apply_security_headers(response)

    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')

    # Create tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
