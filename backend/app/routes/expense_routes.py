from flask import Blueprint, request, jsonify, g
from ..schemas import expense_schema, expenses_schema, expense_input_schema
from ..services import ExpenseService, ExpenseNotFoundError, ExpenseServiceError
from ..utils.auth_utils import token_required
from marshmallow import ValidationError

expense_bp = Blueprint('expenses', __name__)

@expense_bp.route('/ping', methods=['GET'])
def ping_api_route():
     return jsonify({"message": "Finance tracker API is online!"})

@expense_bp.route('/expenses', methods=['GET'])
@token_required
def get_expenses_route():
    user_id = g.current_user.id
    try:
        user_expenses = ExpenseService.get_all_expenses(user_id=user_id)
        return jsonify(expenses_schema.dump(user_expenses)), 200
    except ExpenseServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in get_expenses_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@expense_bp.route('/expenses', methods=['POST'])
@token_required
def add_expense_route():
    user_id = g.current_user.id
    json_data = request.get_json()
    if not json_data: return jsonify({"error": "No input data"}), 400
    try:
        expense_data_obj = expense_input_schema.load(json_data)
    except ValidationError as err: return jsonify({"error": "Invalid input", "messages": err.messages}), 400
    try:
        new_expense = ExpenseService.add_new_expense(expense_data_obj, user_id=user_id)
        return jsonify(expense_schema.dump(new_expense)), 201
    except ExpenseServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in add_expense_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@expense_bp.route('/expenses/<int:expense_id>', methods=['GET'])
@token_required
def get_single_expense_route(expense_id):
    user_id = g.current_user.id
    try:
        expense = ExpenseService.get_expense_by_id(expense_id, user_id=user_id)
        return jsonify(expense_schema.dump(expense)), 200
    except ExpenseNotFoundError as e: return jsonify({"error": str(e)}), 404
    except ExpenseServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in get_single_expense_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@expense_bp.route('/expenses/<int:expense_id>', methods=['PUT'])
@token_required
def update_expense_route(expense_id):
    user_id = g.current_user.id
    json_data = request.get_json()
    if not json_data: return jsonify({"error": "No input data"}), 400
    try:
        update_payload = expense_input_schema.load(json_data)
    except ValidationError as err: return jsonify({"error": "Invalid input", "messages": err.messages}), 400
    try:
        updated_expense = ExpenseService.update_expense(expense_id, update_payload, user_id=user_id)
        return jsonify(expense_schema.dump(updated_expense)), 200
    except ExpenseNotFoundError as e: return jsonify({"error": str(e)}), 404
    except ExpenseServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in update_expense_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@expense_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
@token_required
def delete_expense_route(expense_id):
    user_id = g.current_user.id
    try:
        ExpenseService.delete_expense_by_id(expense_id, user_id=user_id)
        return '', 204
    except ExpenseNotFoundError as e: return jsonify({"error": str(e)}), 404
    except ExpenseServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in delete_expense_route: {e}"); return jsonify({"error": "Internal server error"}), 500