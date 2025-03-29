# backend/app/routes/__init__.py
from .expense_routes import expense_bp
from .base_routes import base_bp
from .income_routes import income_bp # Pridaný import

all_blueprints = (
    expense_bp,
    income_bp, # Pridaný income_bp
    base_bp,
)