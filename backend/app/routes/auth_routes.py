from flask import Blueprint, request, jsonify, g
# === UPDATED IMPORTS ===
from marshmallow import Schema, fields, ValidationError, validate, validates_schema
# =======================
from ..database import db
from ..models import User
from ..schemas import user_schema # Importuj inštanciu user_schema
from ..utils.auth_utils import generate_token, token_required

auth_bp = Blueprint('auth', __name__)

# --- Schémy pre validáciu vstupu ---
class RegisterSchema(Schema):
    username = fields.String(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))

class LoginSchema(Schema):
    login = fields.String(required=True) # Can be username or email
    password = fields.String(required=True)

# --- NOVÁ SCHÉMA ---
class PasswordChangeSchema(Schema):
    currentPassword = fields.String(required=True, data_key="currentPassword")
    newPassword = fields.String(required=True, validate=validate.Length(min=6), data_key="newPassword")
    confirmNewPassword = fields.String(required=True, data_key="confirmNewPassword")

    # Validácia na úrovni schémy, aby sme overili zhodu hesiel
    @validates_schema
    def validate_passwords(self, data, **kwargs):
        if data['newPassword'] != data['confirmNewPassword']:
            # Kľúč 'confirmNewPassword' sa použije na zobrazenie chyby pri tomto poli
            raise ValidationError("New passwords must match.", field_name='confirmNewPassword')
# ---------------

# --- Endpointy ---
@auth_bp.route('/register', methods=['POST'])
def register():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
    try:
        data = RegisterSchema().load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Invalid input", "messages": err.messages}), 400

    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return jsonify({"error": "Conflict", "message": "Username or email already exists"}), 409

    new_user = User(username=data['username'], email=data['email'])
    new_user.set_password(data['password'])

    try:
        db.session.add(new_user)
        db.session.commit()
        token = generate_token(new_user.id)
        if token:
            user_data = user_schema.dump(new_user)
            return jsonify({
                "message": "User registered successfully",
                "access_token": token,
                "user": user_data # Posielame usera hneď po registrácii
            }), 201
        else:
            # User je už v DB, ale token sa nepodarilo vygenerovať - teoreticky by sa nemalo stať
             db.session.rollback() # Vrátime späť pridanie usera pre konzistenciu
             return jsonify({"error": "Could not generate token after registration"}), 500
    except Exception as e:
        db.session.rollback()
        print(f"Error during registration commit: {e}")
        return jsonify({"error": "Internal server error during registration"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
    try:
        data = LoginSchema().load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Invalid input", "messages": err.messages}), 400

    # Allow login with either username or email
    user = User.query.filter((User.username == data['login']) | (User.email == data['login'])).first()

    if user and user.check_password(data['password']):
        token = generate_token(user.id)
        if token:
            user_data = user_schema.dump(user) # Použi inštanciu user_schema
            return jsonify({"access_token": token, "user": user_data}), 200
        else:
            return jsonify({"error": "Failed to generate token"}), 500
    else:
        return jsonify({"error": "Unauthorized", "message": "Invalid username/email or password"}), 401


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    # g.current_user je nastavený dekorátorom @token_required
    return jsonify(user_schema.dump(g.current_user)), 200


# --- NOVÝ ENDPOINT ---
@auth_bp.route('/change-password', methods=['PUT'])
@token_required # Vyžaduje platný token
def change_user_password():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        # Validuj vstupné dáta pomocou novej schémy
        # data_key="camelCase" v schéme zabezpečí správne načítanie z frontendu
        schema = PasswordChangeSchema()
        data = schema.load(json_data)
    except ValidationError as err:
        # Vráť validačné chyby (napr. krátke heslo, nezhodujúce sa heslá)
        return jsonify({"error": "Invalid input", "messages": err.messages}), 400

    # Získaj aktuálne prihláseného používateľa z `g` (nastavené v @token_required)
    user = g.current_user

    # Over aktuálne heslo
    if not user.check_password(data['currentPassword']):
        # Použijeme 400 Bad Request alebo 401 Unauthorized, 400 je asi vhodnejší pre "nesprávne dáta"
        return jsonify({"error": "Bad Request", "message": "Incorrect current password"}), 400
        # Alternatíva: return jsonify({"error": "Unauthorized", "message": "Incorrect current password"}), 401

    # Ak aktuálne heslo sedí, nastav nové heslo
    try:
        user.set_password(data['newPassword'])
        db.session.commit()
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error changing password for user {user.id}: {e}")
        return jsonify({"error": "Internal server error", "message": "Could not change password"}), 500
# -------------------