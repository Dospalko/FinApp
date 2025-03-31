# backend/app/routes/auth_routes.py
from flask import Blueprint, request, jsonify, g
from marshmallow import Schema, fields, ValidationError, validate
from ..database import db
from ..models import User
# === OPRAVENÝ IMPORT ===
from ..schemas import user_schema # Importuj inštanciu user_schema
# =======================
from ..utils.auth_utils import generate_token, token_required

auth_bp = Blueprint('auth', __name__)

# --- Schémy pre validáciu vstupu ---
class RegisterSchema(Schema):
    username = fields.String(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))

class LoginSchema(Schema):
    login = fields.String(required=True)
    password = fields.String(required=True)

# --- Endpointy ---
@auth_bp.route('/register', methods=['POST'])
def register():
    json_data = request.get_json()
    if not json_data: return jsonify({"error": "No input data"}), 400
    try: data = RegisterSchema().load(json_data)
    except ValidationError as err: return jsonify({"error": "Invalid input", "messages": err.messages}), 400

    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return jsonify({"error": "Conflict", "message": "Username or email already exists"}), 409

    new_user = User(username=data['username'], email=data['email'])
    new_user.set_password(data['password'])

    try:
        db.session.add(new_user)
        db.session.commit()
        token = generate_token(new_user.id)
        if token: return jsonify({"message": "User registered successfully", "access_token": token}), 201
        else: return jsonify({"error": "Could not generate token after registration"}), 500
    except Exception as e:
        db.session.rollback(); print(f"Error during registration commit: {e}"); return jsonify({"error": "Internal server error"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    json_data = request.get_json()
    if not json_data: return jsonify({"error": "No input data"}), 400
    try: data = LoginSchema().load(json_data)
    except ValidationError as err: return jsonify({"error": "Invalid input", "messages": err.messages}), 400

    user = User.query.filter((User.username == data['login']) | (User.email == data['login'])).first()

    if user and user.check_password(data['password']):
        token = generate_token(user.id)
        if token:
            # === OPRAVENÉ POUŽITIE ===
            user_data = user_schema.dump(user) # Použi inštanciu user_schema
            # =========================
            return jsonify({"access_token": token, "user": user_data}), 200
        else: return jsonify({"error": "Failed to generate token"}), 500
    else: return jsonify({"error": "Unauthorized", "message": "Invalid credentials"}), 401


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    # === OPRAVENÉ POUŽITIE ===
    # user_schema je už inštancia, netreba volať UserSchema()
    return jsonify(user_schema.dump(g.current_user)), 200
    # =========================