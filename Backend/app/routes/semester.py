from flask import Blueprint, request
from datetime import datetime
from sqlalchemy import func
from app import db
from app.models.semester_budget import SemesterBudget
from app.models.transaction import Transaction
from app.utils.auth import require_auth, require_role, get_current_user, success_response, error_response

semester_bp = Blueprint('semester', __name__)

@semester_bp.route('', methods=['GET'])
@require_auth
@require_role('student')
def get_semester():
    user = get_current_user()
    now = datetime.utcnow()
    year = int(request.args.get('year', now.year))
    
    budgets = {sb.month: sb for sb in SemesterBudget.query.filter_by(user_id=user.id, year=year).all()}
    
    result = []
    for month in range(7, 13):  # Jul-Dec semester
        sb = budgets.get(month)
        
        # Get actual spending for this month
        month_start = datetime(year, month, 1)
        if month == 12:
            month_end = datetime(year + 1, 1, 1)
        else:
            month_end = datetime(year, month + 1, 1)
        
        spent = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user.id,
            Transaction.type == 'expense',
            Transaction.date >= month_start,
            Transaction.date < month_end
        ).scalar() or 0
        spent = float(spent)
        
        if sb:
            result.append(sb.to_dict(spent=spent))
        else:
            import calendar
            status = 'upcoming'
            if month < now.month and year <= now.year:
                status = 'complete'
            elif month == now.month and year == now.year:
                status = 'active'
            result.append({
                'month': calendar.month_name[month],
                'budget': 30000,
                'spent': spent,
                'status': status,
                'percent': round(spent / 30000 * 100) if spent > 0 else 0,
            })
    
    return success_response(result)

@semester_bp.route('', methods=['POST'])
@require_auth
@require_role('student')
def upsert_semester():
    user = get_current_user()
    data = request.get_json()
    now = datetime.utcnow()
    month = int(data.get('month', now.month))
    year = int(data.get('year', now.year))
    budget = float(data.get('budget', 30000))
    
    sb = SemesterBudget.query.filter_by(user_id=user.id, month=month, year=year).first()
    if not sb:
        sb = SemesterBudget(user_id=user.id, month=month, year=year, budget=budget)
        db.session.add(sb)
    else:
        sb.budget = budget
    db.session.commit()
    return success_response(sb.to_dict())
