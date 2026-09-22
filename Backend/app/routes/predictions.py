from flask import Blueprint
from app import db
from app.ml.predict import predict_next_months
from app.utils.auth import require_auth, require_role, get_current_user, success_response, error_response

predictions_bp = Blueprint('predictions', __name__)

@predictions_bp.route('', methods=['GET'])
@require_auth
@require_role('professional')
def get_predictions():
    user = get_current_user()
    
    result, status, data_points = predict_next_months(user.id, db.session, n_months=3)
    
    if status == 'insufficient_data':
        months_needed = 3 - data_points
        return success_response({
            'available': False,
            'reason': 'insufficient_data',
            'message': f'Need {months_needed} more month(s) of transaction data to generate predictions.',
            'data_points': data_points,
            'predictions': [],
            'historical': [],
        })
    
    return success_response({
        'available': True,
        'predictions': result['predictions'],
        'historical': result['historical'],
        'method': result['method'],
        'data_points': result['data_points'],
        'ai_note': 'Predictions are based on your historical spending patterns using linear regression analysis.'
    })
