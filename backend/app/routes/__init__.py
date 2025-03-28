# backend/app/routes/__init__.py
from .expense_routes import expense_bp
from .base_routes import base_bp

all_blueprints = (
    expense_bp,
    base_bp,
)