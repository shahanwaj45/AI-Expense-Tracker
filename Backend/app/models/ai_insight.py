import uuid
from datetime import datetime
from app import db

class AIInsight(db.Model):
    __tablename__ = 'ai_insights'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    headline = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    source_period = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='ai_insights')

    def to_dict(self):
        now = datetime.utcnow()
        diff = now - self.created_at
        if diff.seconds < 60:
            ts = 'Just now'
        elif diff.seconds < 3600:
            ts = f"{diff.seconds // 60} minutes ago"
        elif diff.days == 0:
            ts = f"{diff.seconds // 3600} hours ago"
        elif diff.days == 1:
            ts = 'Yesterday'
        else:
            ts = f"{diff.days} days ago"
        return {
            'id': self.id,
            'headline': self.headline,
            'description': self.description,
            'timestamp': ts,
            'is_read': self.is_read,
            'source_period': self.source_period,
        }
