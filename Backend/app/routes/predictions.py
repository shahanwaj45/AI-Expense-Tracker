from flask import Blueprint
from app import db
from app.ml.predict import predict_next_months
from app.utils.auth import require_auth, get_current_user, success_response, error_response

predictions_bp = Blueprint('predictions', __name__)

@predictions_bp.route('', methods=['GET'])
@require_auth
def get_predictions():
    user = get_current_user()
    
    result, status, data_points = predict_next_months(user.id, db.session, n_months=3)
    
    if status == 'no_data' or not result:
        return success_response({
            'available': False,
            'reason': 'no_data',
            'message': 'No expense transactions recorded yet. Add your expenses or scan receipts to unlock AI spending forecasting.',
            'data_points': 0,
            'predictions': [],
            'historical': [],
            'category_predictions': [],
        })
    
    return success_response({
        'available': True,
        'predictions': result['predictions'],
        'historical': result['historical'],
        'category_predictions': result.get('category_predictions', []),
        'method': result['method'],
        'data_points': result['data_points'],
        'daily_velocity': result.get('daily_velocity', 0),
        'current_month_spent': result.get('current_month_spent', 0),
        'current_month_projected': result.get('current_month_projected', 0),
        'ai_note': result.get('ai_note', 'AI forecast based on your spending patterns.')
    })
