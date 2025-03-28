from . import db # Import 'db' z __init__.py v rovnakom priečinku
from datetime import datetime, timezone

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=True, default='Nezaradené') # Príklad ďalšieho poľa
    date_created = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Expense {self.id}: {self.description} ({self.amount})>'

    # Metóda na konverziu objektu na slovník (pre JSON odpovede)
    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': self.amount,
            'category': self.category,
            'date_created': self.date_created.isoformat() # Formát vhodný pre JSON
        }