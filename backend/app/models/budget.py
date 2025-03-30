# backend/app/models/budget.py
from ..database import db
from sqlalchemy import UniqueConstraint

class Budget(db.Model):
    __tablename__ = 'budget'

    id = db.Column(db.Integer, primary_key=True)
    # Názov kategórie výdavkov, na ktorú sa rozpočet vzťahuje
    # V jednoduchšej verzii predpokladáme, že názvy kategórií sú konzistentné
    # V zložitejšej by tu bol ForeignKey na samostatnú tabuľku kategórií
    category = db.Column(db.String(50), nullable=False)
    # Suma rozpočtu pre daný mesiac/rok
    amount = db.Column(db.Float, nullable=False)
    # Mesiac (1-12)
    month = db.Column(db.Integer, nullable=False)
    # Rok (napr. 2024)
    year = db.Column(db.Integer, nullable=False)

    # Zabezpečí, že pre kombináciu kategória-mesiac-rok existuje len jeden záznam
    __table_args__ = (UniqueConstraint('category', 'month', 'year', name='uq_budget_category_month_year'),)

    # TODO: Neskôr pridať user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Budget {self.category} ({self.month}/{self.year}): {self.amount}>'