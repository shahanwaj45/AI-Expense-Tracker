import os
import uuid
from flask import Blueprint, request, current_app
from app import db
from app.models.transaction import Transaction, CATEGORY_COLORS
from app.services.ocr_service import scan_receipt
from app.utils.auth import require_auth, get_current_user, success_response, error_response
from datetime import datetime
from werkzeug.utils import secure_filename

receipts_bp = Blueprint('receipts', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf'}

def _allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@receipts_bp.route('/scan', methods=['POST'])
@require_auth
def scan():
    if 'file' not in request.files:
        return error_response('No file uploaded', 'VALIDATION_ERROR')
    
    f = request.files['file']
    if not f.filename:
        return error_response('No file selected', 'VALIDATION_ERROR')
    if not _allowed_file(f.filename):
        return error_response('Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP, PDF', 'VALIDATION_ERROR')
    
    # Check file size (max 10MB)
    f.seek(0, 2)
    size = f.tell()
    f.seek(0)
    if size > 10 * 1024 * 1024:
        return error_response('File too large. Maximum size is 10MB.', 'VALIDATION_ERROR')
    
    # Save to uploads dir with unique name
    ext = f.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4()}.{ext}"
    upload_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_name)
    f.save(file_path)
    
    # Scan
    extracted, err = scan_receipt(file_path)
    
    # Clean up temp file
    try:
        os.remove(file_path)
    except Exception:
        pass
    
    if err:
        return error_response(err, 'OCR_ERROR', status=422)
    
    return success_response({
        'extracted': extracted,
        'message': 'Receipt scanned successfully. Please review and confirm before saving.'
    })

@receipts_bp.route('/recent', methods=['GET'])
@require_auth
def get_recent_scans():
    """Get transactions created from scanned receipts, newest scans first."""
    user = get_current_user()
    limit = int(request.args.get('limit', 10))
    scans = Transaction.query.filter(
        Transaction.user_id == user.id,
        Transaction.notes.ilike('%receipt%')
    ).order_by(Transaction.created_at.desc()).limit(limit).all()
    return success_response({'items': [s.to_dict() for s in scans]})

@receipts_bp.route('/confirm', methods=['POST'])
@require_auth
def confirm():
    """Save a confirmed receipt extraction as a transaction."""
    user = get_current_user()
    data = request.get_json() or {}
    
    name = (data.get('name') or data.get('merchant') or 'Receipt expense').strip()
    category = data.get('category') or 'Other'
    
    try:
        amount = float(data.get('amount', 0))
        if amount <= 0:
            return error_response('Amount must be > 0')
    except (TypeError, ValueError):
        return error_response('Invalid amount')
    
    # Date handling: if use_today is True or date_str is missing, use now
    use_today = data.get('use_today', False)
    date_str = data.get('date')
    
    if use_today or not date_str:
        tx_date = datetime.utcnow()
    else:
        try:
            str_d = str(date_str).strip()
            if len(str_d) == 10:
                parsed_d = datetime.strptime(str_d, '%Y-%m-%d')
                now = datetime.utcnow()
                tx_date = datetime.combine(parsed_d.date(), now.time())
            else:
                tx_date = datetime.fromisoformat(str_d)
        except Exception:
            tx_date = datetime.utcnow()
    
    notes = (data.get('notes') or f"Scanned receipt ({name})").strip()
    payment_method = data.get('payment_method') or 'UPI'
    
    tx = Transaction(
        user_id=user.id,
        type='expense',
        name=name,
        amount=amount,
        category=category,
        payment_method=payment_method,
        date=tx_date,
        color=CATEGORY_COLORS.get(category, 'coral'),
        notes=notes,
    )
    db.session.add(tx)
    db.session.commit()
    
    return success_response(tx.to_dict(), message="Receipt transaction saved successfully", status=201)

