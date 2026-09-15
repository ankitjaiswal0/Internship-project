from flask import request, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

def apply_security_headers(response):
    # Basic Security Headers
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

def log_audit(db, AuditLog, user_id, action, status, severity='INFO'):
    ip = request.remote_addr
    log_entry = AuditLog(user_id=user_id, action=action, status=status, ip_address=ip, severity=severity)
    db.session.add(log_entry)
    db.session.commit()
