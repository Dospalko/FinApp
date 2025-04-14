# backend/app/schemas/weekly_focus_schema.py
from ..database import ma
from ..models import WeeklyFocus # Import modelu
from marshmallow import fields, validate, Schema
import datetime

class WeeklyFocusSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = WeeklyFocus
        load_instance = True
        include_fk = True

    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(dump_only=True)
    week_start_date = fields.Date(dump_only=True) # Len na čítanie
    focus_text = fields.String(required=False, validate=validate.Length(max=255), allow_none=True)
    date_set = fields.DateTime(dump_only=True)

class WeeklyFocusInputSchema(Schema):
     # Mapovanie z camelCase focusText na snake_case focus_text nie je nutné, ak service prijíma focusText
     # Ak by service metóda očakávala snake_case, použil by si data_key:
     # focus_text = fields.String(required=True, validate=validate.Length(min=1, max=255), data_key="focusText")
     # Ale keďže service.set_weekly_focus prijíma argument 'focus_text', necháme to takto:
     focusText = fields.String(required=True, validate=validate.Length(min=1, max=255))


weekly_focus_schema = WeeklyFocusSchema()
weekly_focus_input_schema = WeeklyFocusInputSchema()