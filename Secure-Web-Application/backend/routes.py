from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import (
    create_access_token,
    set_access_cookies,
    unset_jwt_cookies,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from database import db
from models import User, AuditLog, Alert
from auth import bcrypt
from security import limiter, log_audit
import re
from datetime import datetime, timezone
from sqlalchemy import func

api_bp = Blueprint('api', __name__)

def is_strong_password(password):
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    return True

def create_alert(message, user_id=None, severity='MEDIUM'):
    alert = Alert(message=message, user_id=user_id, severity=severity)
    db.session.add(alert)
    db.session.commit()

@api_bp.route('/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter((func.lower(User.username) == func.lower(username)) | (func.lower(User.email) == func.lower(email))).first():
        return jsonify({'error': 'User already exists'}), 409

    if not is_strong_password(password):
        return jsonify({'error': 'Password must be at least 8 characters long and contain uppercase, lowercase, and a number'}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=password_hash)
    
    # Make the first user an admin for easy testing
    if User.query.count() == 0:
        new_user.role = 'ADMIN'

    db.session.add(new_user)
    db.session.commit()

    log_audit(db, AuditLog, new_user.id, 'Registration', 'Success', severity='INFO')

    return jsonify({'message': 'User registered successfully'}), 201


@api_bp.route('/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    user = User.query.filter((func.lower(User.username) == func.lower(username)) | (func.lower(User.email) == func.lower(username))).first()
    
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        if user:
            log_audit(db, AuditLog, user.id, 'Login', 'Failed', severity='WARNING')
            
            # Check for multiple failed logins
            failed_logins = AuditLog.query.filter_by(user_id=user.id, action='Login', status='Failed').order_by(AuditLog.timestamp.desc()).limit(5).all()
            if len(failed_logins) == 5:
                # Naive check to see if all 5 were within a short timeframe could go here
                create_alert('Multiple failed login attempts detected', user.id, 'HIGH')
                
        else:
            log_audit(db, AuditLog, None, f'Login Failed (User: {username})', 'Failed', severity='WARNING')
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    if not user.is_active:
        log_audit(db, AuditLog, user.id, 'Login (Inactive Account)', 'Failed', severity='WARNING')
        create_alert('Login attempt on deactivated account', user.id, 'MEDIUM')
        return jsonify({'error': 'Account is deactivated'}), 403

    # Create token and set cookies
    access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
    resp = jsonify({'message': 'Login successful', 'user': user.to_dict()})
    set_access_cookies(resp, access_token)

    log_audit(db, AuditLog, user.id, 'Login', 'Success', severity='INFO')
    return resp

@api_bp.route('/auth/logout', methods=['POST'])
def logout():
    resp = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(resp)
    try:
        from flask_jwt_extended import verify_jwt_in_request
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            log_audit(db, AuditLog, user_id, 'Logout', 'Success', severity='INFO')
    except:
        pass
    return resp

@api_bp.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

@api_bp.route('/user/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not bcrypt.check_password_hash(user.password_hash, current_password):
        log_audit(db, AuditLog, user_id, 'Password Change Attempt', 'Failed', severity='WARNING')
        return jsonify({'error': 'Incorrect current password'}), 401
        
    if not is_strong_password(new_password):
        return jsonify({'error': 'New password does not meet security requirements'}), 400
        
    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    
    log_audit(db, AuditLog, user_id, 'Password Changed', 'Success', severity='INFO')
    
    # Optional: unset cookies so user must log in again
    resp = jsonify({'message': 'Password changed successfully'})
    unset_jwt_cookies(resp)
    return resp

@api_bp.route('/user/activity', methods=['GET'])
@jwt_required()
def user_activity():
    user_id = get_jwt_identity()
    logs = AuditLog.query.filter_by(user_id=user_id).order_by(AuditLog.timestamp.desc()).limit(20).all()
    return jsonify([log.to_dict() for log in logs]), 200

# ================= ADMIN ROUTES ================= #

def admin_required():
    claims = get_jwt()
    if claims.get('role') != 'ADMIN':
        user_id = get_jwt_identity()
        log_audit(db, AuditLog, user_id, 'Unauthorized Admin Access Attempt', 'Failed', severity='CRITICAL')
        create_alert('Unauthorized admin access attempt', user_id, 'CRITICAL')
        return False
    return True

@api_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    if not admin_required():
        return jsonify({'error': 'Admin access required'}), 403
    
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@api_bp.route('/admin/users/<int:user_id>/status', methods=['PUT'])
@jwt_required()
def change_user_status(user_id):
    if not admin_required():
        return jsonify({'error': 'Admin access required'}), 403
        
    data = request.get_json()
    is_active = data.get('is_active')
    
    if is_active is None:
        return jsonify({'error': 'Missing is_active field'}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    user.is_active = is_active
    db.session.commit()
    
    admin_id = get_jwt_identity()
    action = f"Activated user {user.username}" if is_active else f"Deactivated user {user.username}"
    log_audit(db, AuditLog, admin_id, action, 'Success', severity='INFO')
    
    return jsonify({'message': 'User status updated successfully'}), 200

@api_bp.route('/admin/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def change_user_role(user_id):
    if not admin_required():
        return jsonify({'error': 'Admin access required'}), 403
        
    data = request.get_json()
    role = data.get('role')
    
    if role not in ['USER', 'ADMIN']:
        return jsonify({'error': 'Invalid role specified'}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    user.role = role
    db.session.commit()
    
    admin_id = get_jwt_identity()
    action = f"Changed user {user.username} role to {role}"
    log_audit(db, AuditLog, admin_id, action, 'Success', severity='WARNING')
    if role == 'ADMIN':
        create_alert(f"User {user.username} promoted to ADMIN", admin_id, 'MEDIUM')
    
    return jsonify({'message': 'User role updated successfully'}), 200

@api_bp.route('/admin/logs', methods=['GET'])
@jwt_required()
def get_all_logs():
    if not admin_required():
        return jsonify({'error': 'Admin access required'}), 403
        
    action_filter = request.args.get('action')
    status_filter = request.args.get('status')
    
    query = AuditLog.query
    if action_filter:
        query = query.filter(AuditLog.action.ilike(f'%{action_filter}%'))
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    logs = query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify([log.to_dict() for log in logs]), 200

@api_bp.route('/admin/login-activity', methods=['GET'])
@jwt_required()
def get_login_activity():
    if not admin_required():
        return jsonify({'error': 'Admin access required'}), 403
        
    status_filter = request.args.get('status')
    
    query = AuditLog.query.filter(AuditLog.action.like('Login%'))
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    logs = query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify([log.to_dict() for log in logs]), 200

@api_bp.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    if not admin_required():
        return jsonify({'error': 'Admin access required'}), 403
        
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    failed_logins = AuditLog.query.filter_by(action='Login', status='Failed').count()
    successful_logins = AuditLog.query.filter_by(action='Login', status='Success').count()
    security_alerts = Alert.query.filter_by(status='NEW').count()
    
    # Calculate Security Score based on implemented features (static mapping for demonstration)
    # 15 + 15 + 15 + 15 + 10 + 10 + 10 + 10 = 100
    security_score = 100 
    
    return jsonify({
        'total_users': total_users,
        'active_users': active_users,
        'failed_logins': failed_logins,
        'successful_logins': successful_logins,
        'security_alerts': security_alerts,
        'security_score': security_score
    }), 200
    
@api_bp.route('/admin/security-status', methods=['GET'])
@jwt_required()
def get_security_status():
    if not admin_required():
        return jsonify({'error': 'Admin access required'}), 403
    
    # Return actual implemented controls
    controls = [
        {'id': 'pwd', 'name': 'Password Hashing', 'status': 'PASS', 'details': 'Bcrypt hashing with salts.'},
        {'id': 'rbac', 'name': 'RBAC', 'status': 'PASS', 'details': 'Role-Based Access Control enforcing ADMIN / USER boundaries.'},
        {'id': 'sqli', 'name': 'SQL Injection Protection', 'status': 'PASS', 'details': 'SQLAlchemy ORM uses parameterized queries automatically.'},
        {'id': 'xss', 'name': 'XSS Protection', 'status': 'PASS', 'details': 'React rendering + HttpOnly Cookies prevent XSS data exfiltration.'},
        {'id': 'csrf', 'name': 'CSRF Protection', 'status': 'PASS', 'details': 'Double-submit cookie pattern enabled via Flask-JWT-Extended.'},
        {'id': 'rate', 'name': 'Rate Limiting', 'status': 'PASS', 'details': 'Flask-Limiter restricts login and registration endpoints.'},
        {'id': 'headers', 'name': 'Security Headers', 'status': 'PASS', 'details': 'CSP, X-Content-Type-Options, Referrer-Policy enforced.'},
        {'id': 'audit', 'name': 'Audit Logging', 'status': 'PASS', 'details': 'All critical actions are tracked in the database.'}
    ]
    return jsonify(controls), 200

@api_bp.route('/admin/security-alerts', methods=['GET'])
@jwt_required()
def get_security_alerts():
    if not admin_required():
        return jsonify({'error': 'Admin access required'}), 403
        
    alerts = Alert.query.order_by(Alert.timestamp.desc()).all()
    return jsonify([alert.to_dict() for alert in alerts]), 200

@api_bp.route('/admin/security-alerts/<int:alert_id>', methods=['PATCH'])
@jwt_required()
def update_security_alert(alert_id):
    if not admin_required():
        return jsonify({'error': 'Admin access required'}), 403
        
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
        
    data = request.get_json()
    if 'status' in data:
        alert.status = data['status']
        db.session.commit()
        
        admin_id = get_jwt_identity()
        log_audit(db, AuditLog, admin_id, f"Alert {alert_id} marked as {data['status']}", 'Success', severity='INFO')
        
        return jsonify({'message': 'Alert updated'}), 200
        
    return jsonify({'error': 'No updates provided'}), 400
