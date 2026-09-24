import uuid
from datetime import datetime
from app import db

class EmergencyFund(db.Model):
    __tablename__ = 'emergency_fund'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, unique=True)
    current_amount = db.Column(db.Numeric(12, 2), default=0)
    monthly_expense_estimate = db.Column(db.Numeric(12, 2), default=30000)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', back_populates='emergency_fund')
    contributions = db.relationship('EmergencyFundContribution', back_populates='fund', lazy='dynamic', cascade='all, delete-orphan')

    @property
    def recommended_amount(self):
        return float(self.monthly_expense_estimate) * 6

    @property
    def months_covered(self):
        if float(self.monthly_expense_estimate) == 0:
            return 0
        return round(float(self.current_amount) / float(self.monthly_expense_estimate), 1)

    @property
    def percent_complete(self):
        rec = self.recommended_amount
        if rec == 0:
            return 0
        return min(100, round(float(self.current_amount) / rec * 100))

    def to_dict(self):
        return {
            'id': self.id,
            'current': float(self.current_amount),
            'recommended': self.recommended_amount,
            'monthly_expense_estimate': float(self.monthly_expense_estimate),
            'monthsCovered': self.months_covered,
            'percentComplete': self.percent_complete,
        }

class EmergencyFundContribution(db.Model):
    __tablename__ = 'emergency_fund_contributions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    fund_id = db.Column(db.String(36), db.ForeignKey('emergency_fund.id'), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    fund = db.relationship('EmergencyFund', back_populates='contributions')

    def to_dict(self):
        return {
            'id': self.id,
            'amount': float(self.amount),
            'date': self.date.strftime('%d %b %Y'),
        }
