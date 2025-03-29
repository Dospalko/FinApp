# backend/app/schemas/income_schema.py
from ..database import ma
from ..models.income import Income
from marshmallow import fields, validate

class IncomeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Income
        load_instance = True

    description = fields.String(required=True, validate=validate.Length(min=1, error="Popis nesmie byť prázdny."))
    amount = fields.Float(required=True, validate=validate.Range(min=0.01, error="Suma musí byť kladné číslo."))
    source = fields.String(required=False, allow_none=True, validate=validate.Length(max=100))
    # Zahrnieme aj date_created do štandardného výstupu
    date_created = fields.DateTime(dump_only=True) # Len pri serializácii

income_schema = IncomeSchema()
incomes_schema = IncomeSchema(many=True)
# Pri vkladaní/úprave nepotrebujeme id ani date_created
income_input_schema = IncomeSchema(exclude=("id", "date_created"))