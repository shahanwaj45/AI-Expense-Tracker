from flask import Blueprint, request
from datetime import datetime
from sqlalchemy import func, extract
from app import db
from app.models.transaction import Transaction
from app.utils.auth import require_auth, get_current_user, success_response
from app.utils.calculations import get_spending_trend_bars, get_current_month_range

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/trend', methods=['GET'])
@analytics_bp.route('/spending-trend', methods=['GET'])
@require_auth
def trend():
    user = get_current_user()
    bars = get_spending_trend_bars(user.id, db.session)
    return success_response(bars)

@analytics_bp.route('/categories', methods=['GET'])
@require_auth
def categories():
    user = get_current_user()
    start, end = get_current_month_range()
    rows = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == user.id,
        Transaction.type == 'expense',
        Transaction.date >= start,
        Transaction.date < end,
    ).group_by(Transaction.category).all()
    
    result = [{'category': r.category, 'total': float(r.total), 'formatted': f"₹{float(r.total):,.0f}"} for r in rows]
    return success_response(result)

@analytics_bp.route('/summary', methods=['GET'])
@require_auth
def summary():
    user = get_current_user()
    start, end = get_current_month_range()
    
    total_spent = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id, Transaction.type == 'expense',
        Transaction.date >= start, Transaction.date < end
    ).scalar() or 0
    
    total_income = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id, Transaction.type == 'income',
        Transaction.date >= start, Transaction.date < end
    ).scalar() or 0
    
    return success_response({
        'total_spent': float(total_spent),
        'total_income': float(total_income),
        'net': float(total_income) - float(total_spent),
    })
