# backend/app/schemas/budget_schema.py
from ..database import ma
from ..models.budget import Budget
from marshmallow import fields, validate

class BudgetSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Budget
        load_instance = True

    # Validácia
    category = fields.String(required=True, validate=validate.Length(min=1))
    amount = fields.Float(required=True, validate=validate.Range(min=0.01))
    month = fields.Integer(required=True, validate=validate.Range(min=1, max=12))
    year = fields.Integer(required=True, validate=validate.Range(min=2000, max=2100)) # Rozumný rozsah rokov

budget_schema = BudgetSchema()
budgets_schema = BudgetSchema(many=True)
# Pre vstup môžeme použiť rovnakú schému, ID sa negeneruje
budget_input_schema = BudgetSchema(exclude=("id",))