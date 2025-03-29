# backend/app/routes/income_routes.py
from flask import Blueprint, request, jsonify
# Importuj schémy a služby pre Income
from ..schemas import income_schema, incomes_schema, income_input_schema
from ..services import IncomeService, IncomeNotFoundError, IncomeServiceError
from marshmallow import ValidationError

income_bp = Blueprint('incomes', __name__) # Bude pod /api

@income_bp.route('/incomes', methods=['GET'])
def get_incomes_route():
    """Získa zoznam všetkých príjmov."""
    try:
        all_incomes = IncomeService.get_all_incomes()
        return jsonify(incomes_schema.dump(all_incomes)), 200
    except IncomeServiceError as e:
         return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in get_incomes_route: {e}")
         return jsonify({"error": "Internal server error"}), 500

@income_bp.route('/incomes', methods=['POST'])
def add_income_route():
    """Pridá nový príjem."""
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
    try:
        # Použi income_input_schema na validáciu a vytvorenie objektu
        income_object = income_input_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Invalid input data", "messages": err.messages}), 400
    try:
        new_income = IncomeService.add_new_income(income_object)
        return jsonify(income_schema.dump(new_income)), 201
    except IncomeServiceError as e:
         return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in add_income_route: {e}")
         return jsonify({"error": "Internal server error"}), 500

@income_bp.route('/incomes/<int:income_id>', methods=['DELETE'])
def delete_income_route(income_id):
    """Vymaže príjem podľa ID."""
    try:
        IncomeService.delete_income_by_id(income_id)
        return '', 204
    except IncomeNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except IncomeServiceError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in delete_income_route: {e}")
         return jsonify({"error": "Internal server error"}), 500