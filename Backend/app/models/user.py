import uuid
from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    initials = db.Column(db.String(5), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student' or 'professional'
    password_hash = db.Column(db.String(255), nullable=False)
    monthly_allowance = db.Column(db.Numeric(12, 2), default=30000.00)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transactions = db.relationship('Transaction', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    budgets = db.relationship('Budget', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    savings_goals = db.relationship('SavingsGoal', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    emergency_fund = db.relationship('EmergencyFund', back_populates='user', uselist=False, cascade='all, delete-orphan')
    subscriptions = db.relationship('Subscription', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    income_sources = db.relationship('IncomeSource', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    projects = db.relationship('Project', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    semester_budgets = db.relationship('SemesterBudget', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    ai_insights = db.relationship('AIInsight', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'initials': self.initials,
            'role': self.role,
        }

    @staticmethod
    def generate_initials(name):
        parts = name.strip().split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[-1][0]).upper()
        return name[:2].upper() if len(name) >= 2 else name[0].upper()
