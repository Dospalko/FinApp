# backend/app/routes/report_routes.py
from flask import Blueprint, jsonify, g, request
from ..services.report_service import ReportService, ReportServiceError
from ..schemas import weekly_focus_schema, weekly_focus_input_schema
from ..utils.auth_utils import token_required
from marshmallow import ValidationError
import traceback

report_bp = Blueprint('reports', __name__) # Prefix /api/reports je definovaný v __init__.py

@report_bp.route('/weekly-snapshot', methods=['GET']) # Relatívna cesta k /api/reports/weekly-snapshot
@token_required
def get_weekly_snapshot_route():
    user_id = g.current_user.id
    try:
        snapshot = ReportService.get_weekly_snapshot(user_id)
        return jsonify(snapshot), 200
    except ReportServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e: print(f"[RouteError] get_weekly_snapshot_route User:{user_id}: {e}"); traceback.print_exc(); return jsonify({"error": "Internal server error"}), 500

@report_bp.route('/weekly-focus', methods=['POST']) # Relatívna cesta k /api/reports/weekly-focus
@token_required
def set_weekly_focus_route():
    user_id = g.current_user.id
    json_data = request.get_json()
    if not json_data: return jsonify({"error": "No input data provided"}), 400
    try: data = weekly_focus_input_schema.load(json_data)
    except ValidationError as err: return jsonify({"error": "Invalid input", "messages": err.messages}), 400
    try:
        saved_focus = ReportService.set_weekly_focus(user_id, data['focusText'])
        return jsonify(weekly_focus_schema.dump(saved_focus)), 200
    except ReportServiceError as e: return jsonify({"error": str(e)}), 400
    except Exception as e: print(f"[RouteError] set_weekly_focus_route User:{user_id}: {e}"); traceback.print_exc(); return jsonify({"error": "Internal server error"}), 500