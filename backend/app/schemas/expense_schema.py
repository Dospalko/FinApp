# backend/app/schemas/expense_schema.py
from ..database import ma # Opravený relatívny import
from ..models.expense import Expense # Opravený relatívny import
from marshmallow import fields, validate

class ExpenseSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Expense
        load_instance = True

    description = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Popis nesmie byť prázdny.")
    )
    amount = fields.Float(
        required=True,
        validate=validate.Range(min=0.01, error="Suma musí byť kladné číslo.")
    )
    category = fields.String(required=False, allow_none=True, validate=validate.Length(max=50))

# Inštancie schém
expense_schema = ExpenseSchema()
expenses_schema = ExpenseSchema(many=True)
expense_input_schema = ExpenseSchema(exclude=("id", "date_created"))