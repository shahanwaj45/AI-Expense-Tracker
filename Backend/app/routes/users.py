from flask import Blueprint, request
from app import db
from app.models.user import User
from app.utils.auth import require_auth, get_current_user, success_response, error_response

users_bp = Blueprint('users', __name__)

@users_bp.route('/me', methods=['GET'])
@require_auth
def get_me():
    user = get_current_user()
    return success_response(user.to_dict())

@users_bp.route('/me', methods=['PATCH'])
@require_auth
def update_me():
    user = get_current_user()
    data = request.get_json()
    if 'name' in data:
        user.name = data['name'].strip()
        user.initials = User.generate_initials(user.name)
    if 'monthly_allowance' in data:
        try:
            user.monthly_allowance = float(data['monthly_allowance'])
        except (TypeError, ValueError):
            return error_response('Invalid allowance amount')
    db.session.commit()
    return success_response(user.to_dict())
