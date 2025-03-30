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

    rule_category = fields.String(
        required=False, # Nepovinné pri zadávaní
        allow_none=True,
        validate=validate.OneOf(['Needs', 'Wants', 'Savings'], error="Neplatná kategória pravidla (Needs, Wants, Savings)")
    )
    date_created = fields.DateTime(dump_only=True, format='iso') # Vraciame pôvodné pole pre dátum

expense_schema = ExpenseSchema()
expenses_schema = ExpenseSchema(many=True)
# Pridáme rule_category aj do vstupu, ale id a date_created vylúčime
expense_input_schema = ExpenseSchema(exclude=("id", "date_created"))