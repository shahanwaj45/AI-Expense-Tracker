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

@receipts_bp.route('/confirm', methods=['POST'])
@require_auth
def confirm():
    """Save a confirmed receipt extraction as a transaction."""
    user = get_current_user()
    data = request.get_json()
    
    name = data.get('name', data.get('merchant', 'Receipt expense')).strip()
    category = data.get('category', 'Other')
    
    try:
        amount = float(data.get('amount', 0))
        if amount <= 0:
            return error_response('Amount must be > 0')
    except (TypeError, ValueError):
        return error_response('Invalid amount')
    
    date_str = data.get('date')
    if date_str:
        try:
            tx_date = datetime.fromisoformat(str(date_str))
        except ValueError:
            tx_date = datetime.utcnow()
    else:
        tx_date = datetime.utcnow()
    
    tx = Transaction(
        user_id=user.id,
        type='expense',
        name=name,
        amount=amount,
        category=category,
        payment_method=data.get('payment_method', 'Other'),
        date=tx_date,
        color=CATEGORY_COLORS.get(category, 'coral'),
        notes=f"Scanned receipt",
    )
    db.session.add(tx)
    db.session.commit()
    
    return success_response(tx.to_dict(), status=201)
