import uuid
from datetime import datetime
from app import db

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    cycle = db.Column(db.String(20), default='Monthly')
    next_billing_date = db.Column(db.Date)
    color = db.Column(db.String(20), default='#7BE2BE')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='subscriptions')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'amount': f"₹{float(self.amount):,.0f}",
            'amount_raw': float(self.amount),
            'cycle': self.cycle,
            'next': self.next_billing_date.strftime('%d %b') if self.next_billing_date else None,
            'color': self.color,
            'active': self.is_active,
        }
