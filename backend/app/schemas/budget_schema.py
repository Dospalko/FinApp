# backend/app/schemas/budget_schema.py
from ..database import ma
from ..models import Budget
from marshmallow import fields, validate

class BudgetSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Budget
        load_instance = True
        # exclude = ("owner",) # backref

    category = fields.String(required=True, validate=validate.Length(min=1))
    amount = fields.Float(required=True, validate=validate.Range(min=0.01))
    month = fields.Integer(required=True, validate=validate.Range(min=1, max=12))
    year = fields.Integer(required=True, validate=validate.Range(min=2000, max=2100))
    user_id = fields.Integer(dump_only=True) # Len na čítanie

budget_schema = BudgetSchema()
budgets_schema = BudgetSchema(many=True)
# Vstup nepotrebuje id a user_id
budget_input_schema = BudgetSchema(exclude=("id", "user_id"))