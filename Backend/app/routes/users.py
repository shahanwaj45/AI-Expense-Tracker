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

@users_bp.route('/export', methods=['GET'])
@require_auth
def export_transactions():
    import csv
    import io
    from flask import Response
    from app.models.transaction import Transaction
    
    user = get_current_user()
    txs = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.date.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Date', 'Name', 'Category', 'Amount (INR)', 'Type', 'Payment Method', 'Notes'])
    
    for t in txs:
        writer.writerow([
            t.id,
            t.date.strftime('%Y-%m-%d %H:%M:%S') if t.date else '',
            t.name,
            t.category,
            float(t.amount),
            t.type,
            t.payment_method or '',
            t.notes or ''
        ])
    
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename=expenses_{user.id[:8]}.csv'}
    )
