# backend/app/models/expense.py
from ..database import db
from datetime import datetime, timezone

class Expense(db.Model):
    __tablename__ = 'expense'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=True, default='Nezaradené')
    date_created = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    rule_category = db.Column(db.String(10), nullable=True) # Pre 50/30/20 pravidlo
    # Cudzí kľúč - MAL BY TU UŽ BYŤ
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Expense {self.id}: {self.description} by User {self.user_id}>'