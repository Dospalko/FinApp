# backend/app/models/user.py
from ..database import db
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    date_registered = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    expenses = db.relationship('Expense', backref='author', lazy='dynamic', cascade="all, delete-orphan")
    incomes = db.relationship('Income', backref='recipient', lazy='dynamic', cascade="all, delete-orphan") # Nové
    budgets = db.relationship('Budget', backref='owner', lazy='dynamic', cascade="all, delete-orphan")     # Nové

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'