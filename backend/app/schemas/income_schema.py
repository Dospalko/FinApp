# backend/app/schemas/income_schema.py
from ..database import ma
from ..models import Income
from marshmallow import fields, validate

class IncomeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Income
        load_instance = True
        # exclude = ("recipient",) # backref

    description = fields.String(required=True, validate=validate.Length(min=1))
    amount = fields.Float(required=True, validate=validate.Range(min=0.01))
    source = fields.String(required=False, allow_none=True, validate=validate.Length(max=100))
    date_created = fields.DateTime(dump_only=True, format='iso')
    user_id = fields.Integer(dump_only=True) # Len na čítanie

income_schema = IncomeSchema()
incomes_schema = IncomeSchema(many=True)
income_input_schema = IncomeSchema(exclude=("id", "date_created", "user_id"))