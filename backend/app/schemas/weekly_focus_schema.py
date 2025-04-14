# backend/app/schemas/weekly_focus_schema.py

from ..database import ma
from ..models.weekly_focus import WeeklyFocus
from marshmallow import fields, Schema
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema


# 1) Schéma na VSTUP – validuje, čo ti posiela frontend (napr. focusText).
class WeeklyFocusInputSchema(Schema):
    focusText = fields.Str(required=True)

weekly_focus_input_schema = WeeklyFocusInputSchema()


# 2) Schéma na VÝSTUP – serializuje model WeeklyFocus (vraciaš ho napr. ako JSON).
class WeeklyFocusSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = WeeklyFocus
        load_instance = True
        # Ak nechceš vrátiť celé user prepojenie, stačí:
        # exclude = ("user",)

    # Môžeš voliteľne “nadpísať” polia, ak chceš zmeniť správanie.
    id = fields.Int(dump_only=True)
    user_id = fields.Int()        # Nastavené, aby bolo súčasťou JSON
    focus_text = fields.Str()
    date_set = fields.DateTime()

weekly_focus_schema = WeeklyFocusSchema()           # Pre jeden objekt
weekly_focuses_schema = WeeklyFocusSchema(many=True)  # Pre viac objektov
