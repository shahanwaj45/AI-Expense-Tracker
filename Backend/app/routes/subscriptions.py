from flask import Blueprint, request
from app import db
from app.models.subscription import Subscription
from app.utils.auth import require_auth, get_current_user, success_response, error_response
from datetime import date

subscriptions_bp = Blueprint('subscriptions', __name__)

@subscriptions_bp.route('', methods=['GET'])
@require_auth
def list_subs():
    user = get_current_user()
    subs = Subscription.query.filter_by(user_id=user.id, is_active=True).order_by(Subscription.created_at.asc()).all()
    total = sum(float(s.amount) for s in subs)
    return success_response({
        'items': [s.to_dict() for s in subs],
        'total': total,
        'total_formatted': f"₹{total:,.0f}",
        'count': len(subs)
    })

@subscriptions_bp.route('', methods=['POST'])
@require_auth
def create_sub():
    user = get_current_user()
    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return error_response('Name required', 'VALIDATION_ERROR')
    try:
        amount = float(data.get('amount', 0))
    except (TypeError, ValueError):
        return error_response('Invalid amount')
    
    next_date = None
    if data.get('next_billing_date'):
        try:
            next_date = date.fromisoformat(data['next_billing_date'])
        except ValueError:
            pass
    
    s = Subscription(
        user_id=user.id,
        name=name,
        amount=amount,
        cycle=data.get('cycle', 'Monthly'),
        next_billing_date=next_date,
        color=data.get('color', '#7BE2BE'),
    )
    db.session.add(s)
    db.session.commit()
    return success_response(s.to_dict(), status=201)

@subscriptions_bp.route('/<sid>', methods=['PATCH'])
@require_auth
def update_sub(sid):
    user = get_current_user()
    s = Subscription.query.filter_by(id=sid, user_id=user.id).first()
    if not s:
        return error_response('Subscription not found', 'NOT_FOUND', status=404)
    data = request.get_json()
    if 'name' in data:
        s.name = data['name']
    if 'amount' in data:
        s.amount = float(data['amount'])
    if 'cycle' in data:
        s.cycle = data['cycle']
    if 'is_active' in data:
        s.is_active = bool(data['is_active'])
    db.session.commit()
    return success_response(s.to_dict())

@subscriptions_bp.route('/<sid>', methods=['DELETE'])
@require_auth
def delete_sub(sid):
    user = get_current_user()
    s = Subscription.query.filter_by(id=sid, user_id=user.id).first()
    if not s:
        return error_response('Subscription not found', 'NOT_FOUND', status=404)
    db.session.delete(s)
    db.session.commit()
    return success_response(message='Subscription deleted')
