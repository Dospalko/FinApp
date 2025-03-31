from flask import Blueprint, request, jsonify, g
from ..schemas import income_schema, incomes_schema, income_input_schema
from ..services import IncomeService, IncomeNotFoundError, IncomeServiceError
from ..utils.auth_utils import token_required
from marshmallow import ValidationError

income_bp = Blueprint('incomes', __name__)

@income_bp.route('/incomes', methods=['GET'])
@token_required
def get_incomes_route():
    user_id = g.current_user.id
    try:
        all_incomes = IncomeService.get_all_incomes(user_id=user_id)
        return jsonify(incomes_schema.dump(all_incomes)), 200
    except IncomeServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error in get_incomes_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@income_bp.route('/incomes', methods=['POST'])
@token_required
def add_income_route():
    user_id = g.current_user.id
    json_data = request.get_json()
    if not json_data: return jsonify({"error": "No input data"}), 400
    try:
        income_object = income_input_schema.load(json_data)
    except ValidationError as err: return jsonify({"error": "Invalid input", "messages": err.messages}), 400
    try:
        new_income = IncomeService.add_new_income(income_object, user_id=user_id)
        return jsonify(income_schema.dump(new_income)), 201
    except IncomeServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error in add_income_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@income_bp.route('/incomes/<int:income_id>', methods=['GET'])
@token_required
def get_single_income_route(income_id):
    user_id = g.current_user.id
    try:
        income = IncomeService.get_income_by_id(income_id, user_id=user_id)
        return jsonify(income_schema.dump(income)), 200
    except IncomeNotFoundError as e: return jsonify({"error": str(e)}), 404
    except IncomeServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error in get_single_income_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@income_bp.route('/incomes/<int:income_id>', methods=['PUT'])
@token_required
def update_income_route(income_id):
    user_id = g.current_user.id
    json_data = request.get_json()
    if not json_data: return jsonify({"error": "No input data"}), 400
    try:
        update_payload = income_input_schema.load(json_data)
    except ValidationError as err: return jsonify({"error": "Invalid input", "messages": err.messages}), 400
    try:
        updated_income = IncomeService.update_income(income_id, update_payload, user_id=user_id)
        return jsonify(income_schema.dump(updated_income)), 200
    except IncomeNotFoundError as e: return jsonify({"error": str(e)}), 404
    except IncomeServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in update_income_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@income_bp.route('/incomes/<int:income_id>', methods=['DELETE'])
@token_required
def delete_income_route(income_id):
    user_id = g.current_user.id
    try:
        IncomeService.delete_income_by_id(income_id, user_id=user_id)
        return '', 204
    except IncomeNotFoundError as e: return jsonify({"error": str(e)}), 404
    except IncomeServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in delete_income_route: {e}"); return jsonify({"error": "Internal server error"}), 500