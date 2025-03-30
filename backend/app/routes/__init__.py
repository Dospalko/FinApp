# backend/app/routes/__init__.py
from .expense_routes import expense_bp
from .base_routes import base_bp
from .income_routes import income_bp
from .budget_routes import budget_bp # <- Pridané

all_blueprints = (
    expense_bp,
    income_bp,
    budget_bp, # <- Pridané
    base_bp,
)