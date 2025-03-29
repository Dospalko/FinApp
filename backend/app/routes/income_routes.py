# backend/app/routes/income_routes.py
from flask import Blueprint, request, jsonify
from ..schemas import income_schema, incomes_schema, income_input_schema
from ..services import IncomeService, IncomeNotFoundError, IncomeServiceError
from marshmallow import ValidationError

income_bp = Blueprint('incomes', __name__)

# --- Routa pre /incomes (GET - zoznam, POST - pridať) ---
@income_bp.route('/incomes', methods=['GET', 'POST'])
def handle_incomes():
    if request.method == 'POST':
        # --- Logika pre POST (pridanie) ---
        json_data = request.get_json()
        if not json_data: return jsonify({"error": "No input data provided"}), 400
        try:
            income_object = income_input_schema.load(json_data)
        except ValidationError as err:
            return jsonify({"error": "Invalid input data", "messages": err.messages}), 400
        try:
            new_income = IncomeService.add_new_income(income_object)
            return jsonify(income_schema.dump(new_income)), 201
        except IncomeServiceError as e: return jsonify({"error": str(e)}), 500
        except Exception as e:
            print(f"Unexpected error in add_income_route: {e}")
            return jsonify({"error": "Internal server error"}), 500
    else: # request.method == 'GET'
        # --- Logika pre GET (zoznam) ---
        try:
            all_incomes = IncomeService.get_all_incomes()
            return jsonify(incomes_schema.dump(all_incomes)), 200
        except IncomeServiceError as e: return jsonify({"error": str(e)}), 500
        except Exception as e:
            print(f"Unexpected error in get_incomes_route: {e}")
            return jsonify({"error": "Internal server error"}), 500

# --- Routa pre /incomes/<id> (GET - detail, PUT - update, DELETE - zmazať) ---
@income_bp.route('/incomes/<int:income_id>', methods=['GET', 'PUT', 'DELETE']) # <- Všetky metódy tu
def handle_single_income(income_id):
    if request.method == 'PUT':
        # --- Logika pre PUT (update) ---
        json_data = request.get_json()
        if not json_data: return jsonify({"error": "No input data provided"}), 400
        try:
            update_payload = income_input_schema.load(json_data)
        except ValidationError as err:
            return jsonify({"error": "Invalid input data", "messages": err.messages}), 400
        try:
            updated_income = IncomeService.update_income(income_id, update_payload)
            return jsonify(income_schema.dump(updated_income)), 200
        except IncomeNotFoundError as e: return jsonify({"error": str(e)}), 404
        except IncomeServiceError as e: return jsonify({"error": str(e)}), 500
        except Exception as e:
             print(f"Unexpected error in update_income_route: {e}")
             return jsonify({"error": "Internal server error"}), 500

    elif request.method == 'DELETE':
        # --- Logika pre DELETE ---
        try:
            IncomeService.delete_income_by_id(income_id)
            return '', 204
        except IncomeNotFoundError as e: return jsonify({"error": str(e)}), 404
        except IncomeServiceError as e: return jsonify({"error": str(e)}), 500
        except Exception as e:
             print(f"Unexpected error in delete_income_route: {e}")
             return jsonify({"error": "Internal server error"}), 500

    else: # request.method == 'GET'
        # --- Logika pre GET (detail) ---
         try:
             income = IncomeService.get_income_by_id(income_id)
             return jsonify(income_schema.dump(income)), 200
         except IncomeNotFoundError as e: return jsonify({"error": str(e)}), 404
         except IncomeServiceError as e: return jsonify({"error": str(e)}), 500
         except Exception as e:
             print(f"Unexpected error in get_single_income_route: {e}")
             return jsonify({"error": "Internal server error"}), 500