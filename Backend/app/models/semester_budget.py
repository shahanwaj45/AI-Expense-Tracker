import uuid
from datetime import datetime
from app import db

class SemesterBudget(db.Model):
    __tablename__ = 'semester_budgets'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    budget = db.Column(db.Numeric(12, 2), nullable=False, default=30000)
    status = db.Column(db.String(20), default='upcoming')  # upcoming, active, complete

    user = db.relationship('User', back_populates='semester_budgets')

    def to_dict(self, spent=0):
        import calendar
        budget_val = float(self.budget)
        pct = round(spent / budget_val * 100) if budget_val > 0 else 0
        return {
            'id': self.id,
            'month': calendar.month_name[self.month],
            'budget': budget_val,
            'spent': spent,
            'status': self.status,
            'percent': pct,
        }
