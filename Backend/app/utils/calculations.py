from datetime import datetime, date

def format_inr(amount):
    """Format a number as Indian Rupee string (e.g. 11550 -> '₹11,550')"""
    return f"₹{float(amount):,.0f}"

def get_current_month_range():
    """Returns (start_datetime, end_datetime) for current month"""
    now = datetime.utcnow()
    start = datetime(now.year, now.month, 1)
    if now.month == 12:
        end = datetime(now.year + 1, 1, 1)
    else:
        end = datetime(now.year, now.month + 1, 1)
    return start, end

def calculate_financial_health(user, db_session=None):
    """
    Calculate financial health score (0-100) based on:
    - Budget adherence (40 pts)
    - Savings goal progress (30 pts)
    - Emergency fund (20 pts)
    - Spending trend (10 pts)
    """
    from app.models.transaction import Transaction
    from sqlalchemy import func
    
    score = 0
    start, end = get_current_month_range()
    
    # Get current month spending
    monthly_spent = db_session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id,
        Transaction.type == 'expense',
        Transaction.date >= start,
        Transaction.date < end
    ).scalar() or 0
    monthly_spent = float(monthly_spent)
    
    # Budget adherence
    monthly_budget = float(user.monthly_allowance) if user.monthly_allowance else 30000
    if monthly_budget > 0:
        usage_pct = (monthly_spent / monthly_budget) * 100
        if usage_pct <= 70:
            budget_score = 40
        elif usage_pct <= 100:
            budget_score = max(20, 40 - (usage_pct - 70) * 0.67)
        else:
            budget_score = max(0, 20 - (usage_pct - 100) * 0.5)
        score += budget_score

    # Savings goal progress
    goals = user.savings_goals.all()
    if goals:
        avg_progress = sum(g.percent_complete for g in goals) / len(goals)
        score += (avg_progress / 100) * 30
    else:
        score += 15  # Neutral if no goals set

    # Emergency fund
    ef = user.emergency_fund
    if ef:
        months_covered = ef.months_covered
        ef_score = min(1.0, months_covered / 6.0) * 20
        score += ef_score
    else:
        score += 0

    # Spending trend (last month vs current month)
    last_month_dt = datetime(start.year if start.month > 1 else start.year - 1, 
                             start.month - 1 if start.month > 1 else 12, 1)
    last_month_spent = db_session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id,
        Transaction.type == 'expense',
        Transaction.date >= last_month_dt,
        Transaction.date < start
    ).scalar() or 0
    last_month_spent = float(last_month_spent)
    
    if last_month_spent == 0 or monthly_spent <= last_month_spent:
        score += 10
    else:
        pct_increase = (monthly_spent - last_month_spent) / last_month_spent
        score += max(0, 10 - pct_increase * 20)

    return round(min(100, score))

def get_spending_trend_bars(user_id, db_session):
    """Return 12-month spending trend as normalized height values (0-100)"""
    from app.models.transaction import Transaction
    from sqlalchemy import func, extract
    import calendar
    
    now = datetime.utcnow()
    rows = db_session.query(
        extract('year', Transaction.date).label('year'),
        extract('month', Transaction.date).label('month'),
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense'
    ).group_by('year', 'month').all()
    
    monthly_totals = {(int(r.year), int(r.month)): float(r.total) for r in rows}
    
    bars = []
    max_val = max(monthly_totals.values()) if monthly_totals else 1
    
    for i in range(12, 0, -1):
        month_num = ((now.month - i - 1) % 12) + 1
        year = now.year if (now.month - i) > 0 else now.year - 1
        if (now.month - i) <= 0:
            month_num = (now.month - i + 12) % 12
            if month_num == 0:
                month_num = 12
        
        total = monthly_totals.get((year, month_num), 0)
        height = round((total / max_val) * 90) if max_val > 0 else 20
        height = max(10, height)
        
        bars.append({
            'month': calendar.month_abbr[month_num],
            'height': height,
            'isHighlighted': (month_num == now.month and year == now.year),
            'amount': total,
        })
    
    return bars
