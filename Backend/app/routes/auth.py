from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from app import db
from app.models.user import User
from app.utils.auth import require_auth, get_current_user, success_response, error_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@auth_bp.route('/signup', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return error_response('Request body required', 'INVALID_REQUEST')
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    role = data.get('role', 'student').lower()
    
    if not email or not password or not name:
        return error_response('Name, email, and password are required', 'VALIDATION_ERROR')
    
    if role not in ('student', 'professional'):
        role = 'student'
        
    existing = User.query.filter_by(email=email).first()
    if existing:
        return error_response('Email already registered', 'CONFLICT', status=409)
        
    user = User(
        name=name,
        email=email,
        initials=User.generate_initials(name),
        role=role,
        monthly_allowance=30000.0 if role == 'student' else 85000.0
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    additional_claims = {'role': user.role}
    token = create_access_token(identity=user.id, additional_claims=additional_claims)
    
    return success_response({
        'token': token,
        'user': user.to_dict()
    }, status=201)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return error_response('Request body required', 'INVALID_REQUEST')
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return error_response('Email and password are required', 'VALIDATION_ERROR', 
                              fields={'email': 'Required' if not email else None, 
                                      'password': 'Required' if not password else None})
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return error_response('Invalid email or password', 'INVALID_CREDENTIALS', status=401)
    
    # Create JWT with role claim
    additional_claims = {'role': user.role}
    token = create_access_token(identity=user.id, additional_claims=additional_claims)
    
    return success_response({
        'token': token,
        'user': user.to_dict()
    })

@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    return success_response(message='Logged out successfully')

@auth_bp.route('/me', methods=['GET'])
@require_auth
def me():
    user = get_current_user()
    if not user:
        return error_response('User not found', 'NOT_FOUND', status=404)
    return success_response(user.to_dict())

@auth_bp.route('/change-password', methods=['POST'])
@require_auth
def change_password():
    user = get_current_user()
    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    
    if not current_password or not new_password:
        return error_response('Current password and new password are required', 'VALIDATION_ERROR')
    
    if not user.check_password(current_password):
        return error_response('Current password is incorrect', 'INVALID_CREDENTIALS', status=400)
    
    if len(new_password) < 6:
        return error_response('New password must be at least 6 characters long', 'VALIDATION_ERROR')
        
    user.set_password(new_password)
    db.session.commit()
    return success_response(message='Password updated successfully')
