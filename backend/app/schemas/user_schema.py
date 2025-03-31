# backend/app/schemas/user_schema.py
from ..database import ma
from ..models import User
from marshmallow import fields

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        # Explicitne vylúčime hash hesla
        exclude = ("password_hash",)

    # Polia sú načítané automaticky, email už je validovaný
    username = fields.String(dump_only=True) # Len na čítanie
    email = fields.Email(dump_only=True)     # Len na čítanie
    date_registered = fields.DateTime(dump_only=True)

user_schema = UserSchema()
users_schema = UserSchema(many=True) # Ak by sme potrebovali zoznam