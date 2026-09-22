from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.models.user import User

def require_auth(f):
    """Decorator: require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception as e:
            return jsonify({'success': False, 'error': {'code': 'UNAUTHORIZED', 'message': 'Authentication required'}}), 401
        return f(*args, **kwargs)
    return decorated

def require_role(*roles):
    """Decorator: require specific role(s). Must come after @require_auth"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                user_role = claims.get('role')
                if user_role not in roles:
                    return jsonify({'success': False, 'error': {'code': 'FORBIDDEN', 'message': f'This endpoint requires role: {", ".join(roles)}'}}), 403
            except Exception:
                return jsonify({'success': False, 'error': {'code': 'UNAUTHORIZED', 'message': 'Authentication required'}}), 401
            return f(*args, **kwargs)
        return decorated
    return decorator

def get_current_user():
    """Get current user from JWT"""
    user_id = get_jwt_identity()
    return User.query.get(user_id)

def success_response(data=None, message=None, status=200):
    resp = {'success': True}
    if data is not None:
        resp['data'] = data
    if message:
        resp['message'] = message
    return jsonify(resp), status

def error_response(message, code='ERROR', fields=None, status=400):
    err = {'code': code, 'message': message}
    if fields:
        err['fields'] = fields
    return jsonify({'success': False, 'error': err}), status
