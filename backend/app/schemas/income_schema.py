# backend/app/schemas/income_schema.py
from ..database import ma
from ..models.income import Income # Importuj nový model
from marshmallow import fields, validate

class IncomeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Income
        load_instance = True # Vytvorí Income objekt pri načítaní

    # Validácia polí
    description = fields.String(
        required=True,
        validate=validate.Length(min=1, error="Popis nesmie byť prázdny.")
    )
    amount = fields.Float(
        required=True,
        validate=validate.Range(min=0.01, error="Suma musí byť kladné číslo.")
    )
    source = fields.String(required=False, allow_none=True, validate=validate.Length(max=100))

# Inštancie schém
income_schema = IncomeSchema()
incomes_schema = IncomeSchema(many=True)
income_input_schema = IncomeSchema(exclude=("id", "date_received"))