# backend/app/models/budget.py
from ..database import db
from sqlalchemy import UniqueConstraint

class Budget(db.Model):
    __tablename__ = 'budget'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    # Cudzí kľúč
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Nové

    # Upravené UniqueConstraint aby zahŕňalo aj user_id
    __table_args__ = (UniqueConstraint('user_id', 'category', 'month', 'year', name='uq_budget_user_category_month_year'),)

    def __repr__(self):
        return f'<Budget User {self.user_id} - {self.category} ({self.month}/{self.year}): {self.amount}>'