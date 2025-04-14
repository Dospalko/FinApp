from .expense_routes import expense_bp
from .income_routes import income_bp
from .budget_routes import budget_bp
from .base_routes import base_bp
from .auth_routes import auth_bp
from .report_routes import report_bp

all_blueprints = (
    expense_bp,
    income_bp,
    budget_bp,
    base_bp,
    auth_bp,
    report_bp,
)