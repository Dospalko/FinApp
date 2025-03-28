# backend/app/routes/base_routes.py
from flask import Blueprint, jsonify

# Tento blueprint už nemá žiadne routy, ale môže tu zostať pre budúcnosť
# alebo ho môžeme úplne odstrániť (potom treba upraviť aj __init__.py a app factory)
# Zatiaľ ho necháme prázdny.
base_bp = Blueprint('base', __name__)

# Sem by mohli prísť routy ako napr. '/' pre základné info o API, ak by sme chceli
# @base_bp.route('/')
# def index():
#     return jsonify({"message": "Welcome to the Finance Tracker API"})