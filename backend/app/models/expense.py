# backend/app/models/expense.py
from ..database import db # Opravený relatívny import
from datetime import datetime, timezone

class Expense(db.Model):
    __tablename__ = 'expense'

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=True, default='Nezaradené')
    date_created = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Expense {self.id}: {self.description} ({self.amount})>'