from flask import Blueprint, request
from datetime import datetime
from app import db
from app.models.budget import Budget
from app.utils.auth import require_auth, get_current_user, success_response, error_response

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('', methods=['GET'])
@require_auth
def list_budgets():
    user = get_current_user()
    now = datetime.utcnow()
    month = int(request.args.get('month', now.month))
    year = int(request.args.get('year', now.year))
    budgets = Budget.query.filter_by(user_id=user.id, month=month, year=year).all()
    
    # Fallback to any active budgets for user if current month hasn't been set yet
    if not budgets:
        budgets = Budget.query.filter_by(user_id=user.id).order_by(Budget.created_at.desc()).limit(6).all()
        
    start = datetime(year, month, 1)
    end = datetime(year + 1, 1, 1) if month == 12 else datetime(year, month + 1, 1)
    
    from app.models.transaction import Transaction
    from sqlalchemy import func
    
    spends = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == user.id,
        Transaction.type == 'expense',
        Transaction.date >= start,
        Transaction.date < end
    ).group_by(Transaction.category).all()
    
    spent_map = {r.category: float(r.total) for r in spends}
    total_spent = sum(spent_map.values())
    total_limit = sum(float(b.limit_amount) for b in budgets)
    used_percent = round((total_spent / total_limit) * 100) if total_limit > 0 else 0
    
    category_list = []
    for b in budgets:
        cat_spent = spent_map.get(b.category, 0.0)
        cat_limit = float(b.limit_amount)
        cat_pct = round((cat_spent / cat_limit) * 100) if cat_limit > 0 else 0
        category_list.append({
            'id': b.id,
            'label': b.category,
            'category': b.category,
            'value': f"₹{cat_limit:,.0f}",
            'limit_amount': cat_limit,
            'spent': cat_spent,
            'spent_formatted': f"₹{cat_spent:,.0f}",
            'remaining': max(0.0, cat_limit - cat_spent),
            'percent_used': cat_pct,
            'color': b.color,
        })
        
    return success_response({
        'categories': category_list,
        'items': category_list,
        'usedPercent': used_percent,
        'total_limit': total_limit,
        'total_spent': total_spent,
        'month': month,
        'year': year
    })

@budgets_bp.route('', methods=['POST'])
@require_auth
def create_budget():
    user = get_current_user()
    data = request.get_json()
    now = datetime.utcnow()
    b = Budget(
        user_id=user.id,
        category=data.get('category', 'Other'),
        limit_amount=float(data.get('limit_amount', 0)),
        color=data.get('color', '#7BE2BE'),
        month=int(data.get('month', now.month)),
        year=int(data.get('year', now.year))
    )
    db.session.add(b)
    db.session.commit()
    return success_response(b.to_dict(), status=201)

@budgets_bp.route('/<bid>', methods=['PATCH'])
@require_auth
def update_budget(bid):
    user = get_current_user()
    b = Budget.query.filter_by(id=bid, user_id=user.id).first()
    if not b:
        return error_response('Budget not found', 'NOT_FOUND', status=404)
    data = request.get_json()
    if 'limit_amount' in data:
        b.limit_amount = float(data['limit_amount'])
    if 'color' in data:
        b.color = data['color']
    db.session.commit()
    return success_response(b.to_dict())

@budgets_bp.route('/<bid>', methods=['DELETE'])
@require_auth
def delete_budget(bid):
    user = get_current_user()
    b = Budget.query.filter_by(id=bid, user_id=user.id).first()
    if not b:
        return error_response('Budget not found', 'NOT_FOUND', status=404)
    db.session.delete(b)
    db.session.commit()
    return success_response(message='Budget deleted')
