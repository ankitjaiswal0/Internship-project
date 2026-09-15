from database import db
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='USER', nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # nullable for failed logins where user might not exist
    action = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False) # 'Success' or 'Failed'
    ip_address = db.Column(db.String(45), nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    severity = db.Column(db.String(20), default='INFO')

    user = db.relationship('User', backref=db.backref('audit_logs', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else 'Unknown',
            'action': self.action,
            'status': self.status,
            'ip_address': self.ip_address,
            'severity': self.severity,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.String(20), default='NEW', nullable=False) # 'NEW', 'REVIEWED', 'RESOLVED'
    severity = db.Column(db.String(20), default='MEDIUM', nullable=False) # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('alerts', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'user_id': self.user_id,
            'username': self.user.username if self.user else 'System/Unknown',
            'status': self.status,
            'severity': self.severity,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
