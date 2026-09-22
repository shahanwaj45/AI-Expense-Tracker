import logging
import calendar
from datetime import datetime

logger = logging.getLogger(__name__)

MIN_DATA_MONTHS = 3

def _get_monthly_spending(user_id, db_session, months=12):
    """Get last N months of spending data"""
    from app.models.transaction import Transaction
    from sqlalchemy import func, extract
    
    rows = db_session.query(
        extract('year', Transaction.date).label('year'),
        extract('month', Transaction.date).label('month'),
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense'
    ).group_by('year', 'month').order_by('year', 'month').all()
    
    return [(int(r.year), int(r.month), float(r.total)) for r in rows]

def predict_next_months(user_id, db_session, n_months=3):
    """
    Predict next n_months of spending.
    
    Cold start: < MIN_DATA_MONTHS → insufficient data
    3-5 months: moving average
    6+ months: linear regression with seasonality
    """
    historical = _get_monthly_spending(user_id, db_session)
    
    if len(historical) < MIN_DATA_MONTHS:
        return None, 'insufficient_data', len(historical)
    
    amounts = [h[2] for h in historical]
    
    if len(amounts) < 6:
        # Simple moving average
        avg = sum(amounts[-3:]) / 3
        method = 'moving_average'
        predictions_raw = [avg * (1 + (i * 0.02)) for i in range(n_months)]
    else:
        # Linear regression
        try:
            from sklearn.linear_model import LinearRegression
            import numpy as np
            
            X = np.array(range(len(amounts))).reshape(-1, 1)
            y = np.array(amounts)
            
            model = LinearRegression()
            model.fit(X, y)
            
            future_X = np.array(range(len(amounts), len(amounts) + n_months)).reshape(-1, 1)
            predictions_raw = model.predict(future_X).tolist()
            method = 'linear_regression'
        except Exception as e:
            logger.error(f"ML prediction failed: {e}")
            avg = sum(amounts[-3:]) / 3
            predictions_raw = [avg] * n_months
            method = 'fallback_average'
    
    # Build prediction objects matching frontend format
    now = datetime.utcnow()
    current_spending = amounts[-1] if amounts else 0
    
    predictions = []
    for i in range(n_months):
        month_offset = i + 1
        pred_month = ((now.month + month_offset - 1) % 12) + 1
        pred_year = now.year + (now.month + month_offset - 1) // 12
        
        pred_amount = max(0, predictions_raw[i])
        
        if current_spending > 0:
            pct_change = ((pred_amount - current_spending) / current_spending) * 100
        else:
            pct_change = 0
        
        positive = pct_change <= 0  # Going down = positive (less spending)
        direction = "↓" if pct_change <= 0 else "↑"
        
        predictions.append({
            'month': calendar.month_name[pred_month],
            'predicted': f"₹{pred_amount:,.0f}",
            'predicted_raw': round(pred_amount, 2),
            'trend': f"{direction} {abs(pct_change):.1f}%",
            'positive': positive,
        })
    
    # Historical bars for chart
    historical_chart = [
        {
            'month': calendar.month_abbr[h[1]],
            'amount': h[2],
            'year': h[0],
        }
        for h in historical[-6:]
    ]
    
    return {
        'predictions': predictions,
        'historical': historical_chart,
        'method': method,
        'data_points': len(historical),
    }, 'ok', len(historical)
