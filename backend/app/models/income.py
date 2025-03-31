# backend/app/models/income.py
from ..database import db
from datetime import datetime, timezone

class Income(db.Model):
    __tablename__ = 'income'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    source = db.Column(db.String(100), nullable=True, default='Neznámy zdroj')
    date_created = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    # Cudzí kľúč
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Nové

    def __repr__(self):
        return f'<Income {self.id}: {self.description} for User {self.user_id}>'