# backend/app/schemas/expense_schema.py
from ..database import ma
from ..models import Expense
from marshmallow import fields, validate

class ExpenseSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Expense
        load_instance = True
        # Nezahrnieme autora priamo, ale user_id
        # exclude = ("author",) # author je backref, nepotrebujeme ho tu

    description = fields.String(required=True, validate=validate.Length(min=1))
    amount = fields.Float(required=True, validate=validate.Range(min=0.01))
    category = fields.String(required=False, allow_none=True, validate=validate.Length(max=50))
    rule_category = fields.String(required=False, allow_none=True, validate=validate.OneOf(['Needs', 'Wants', 'Savings']))
    date_created = fields.DateTime(dump_only=True, format='iso')
    user_id = fields.Integer(dump_only=True) # Len na čítanie

expense_schema = ExpenseSchema()
expenses_schema = ExpenseSchema(many=True)
# Vstupná schéma nepotrebuje user_id, id, date_created
expense_input_schema = ExpenseSchema(exclude=("id", "date_created", "user_id"))