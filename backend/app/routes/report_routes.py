# backend/app/routes/report_routes.py
from flask import Blueprint, jsonify, g, request
from ..services.report_service import ReportService, ReportServiceError
# Import schém s predpokladanými názvami
from ..schemas.weekly_focus_schema import weekly_focus_schema, weekly_focus_input_schema
from ..utils.auth_utils import token_required # Import dekorátora
from marshmallow import ValidationError
import traceback

report_bp = Blueprint('reports', __name__)

@report_bp.route('/weekly-snapshot', methods=['GET'])
@token_required # Pridanie autentizácie
def get_weekly_snapshot_route():
    user_id = g.current_user.id
    try:
        snapshot = ReportService.get_weekly_snapshot(user_id)
        # Skontroluj, či service nevrátil chybu v dátach
        if isinstance(snapshot, dict) and snapshot.get("error"):
             return jsonify({"error": snapshot["error"]}), 500
        return jsonify(snapshot), 200
    except ReportServiceError as e:
        return jsonify({"error": str(e)}), 500 # Chyba v service logike
    except Exception as e:
        print(f"[RouteError] get_weekly_snapshot_route User:{user_id}: {e}")
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500

@report_bp.route('/weekly-focus', methods=['POST'])
@token_required # Pridanie autentizácie
def set_weekly_focus_route():
    user_id = g.current_user.id
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        # Validácia vstupu pomocou vstupnej schémy
        data = weekly_focus_input_schema.load(json_data)
        focus_text = data['focusText'] # Získaj text z validovaných dát
    except ValidationError as err:
        return jsonify({"error": "Invalid input", "messages": err.messages}), 400

    try:
        saved_focus = ReportService.set_weekly_focus(user_id, focus_text)
        # Ak bol fokus vymazaný (text bol prázdny), vrátime úspech bez tela
        if saved_focus is None:
             return jsonify({"message": "Weekly focus cleared successfully"}), 200
        # Inak vrátime serializovaný objekt
        return jsonify(weekly_focus_schema.dump(saved_focus)), 200
    except ReportServiceError as e:
        return jsonify({"error": str(e)}), 400 # Chyba z logiky = zlý vstup
    except Exception as e:
        print(f"[RouteError] set_weekly_focus_route User:{user_id}: {e}")
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500