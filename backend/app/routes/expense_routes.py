# backend/app/routes/expense_routes.py
from flask import Blueprint, request, jsonify
from ..schemas import expense_schema, expenses_schema, expense_input_schema # Opravený import
from ..services import ExpenseService, ExpenseNotFoundError, ExpenseServiceError # Opravený import
from marshmallow import ValidationError

expense_bp = Blueprint('expenses', __name__) # Bude pod /api

# --- PRIDANÝ PING SEM ---
@expense_bp.route('/ping', methods=['GET'])
def ping_api_route():
     """API endpoint na overenie dostupnosti backendu."""
     return jsonify({"message": "Finance tracker API is online!"})
# --- KONIEC PING ---

@expense_bp.route('/expenses', methods=['GET'])
def get_expenses_route():
    """Získa zoznam všetkých výdavkov."""
    try:
        all_expenses = ExpenseService.get_all_expenses()
        return jsonify(expenses_schema.dump(all_expenses)), 200
    except ExpenseServiceError as e:
         return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in get_expenses_route: {e}")
         return jsonify({"error": "Internal server error"}), 500

@expense_bp.route('/expenses', methods=['POST'])
def add_expense_route():
    """Pridá nový výdavok."""
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
    try:
        expense_data = expense_input_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"error": "Invalid input data", "messages": err.messages}), 400
    try:
        new_expense = ExpenseService.add_new_expense(expense_data)
        return jsonify(expense_schema.dump(new_expense)), 201
    except ExpenseServiceError as e:
         return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in add_expense_route: {e}")
         return jsonify({"error": "Internal server error"}), 500

@expense_bp.route('/expenses/<int:expense_id>', methods=['GET'])
def get_single_expense_route(expense_id):
    """Získa jeden výdavok podľa ID."""
    try:
        expense = ExpenseService.get_expense_by_id(expense_id)
        return jsonify(expense_schema.dump(expense)), 200
    except ExpenseNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except ExpenseServiceError as e:
         return jsonify({"error": str(e)}), 500
    except Exception as e:
         print(f"Unexpected error in get_single_expense_route: {e}")
         return jsonify({"error": "Internal server error"}), 500
    
@expense_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense_route(expense_id):
    """Vymaže výdavok podľa ID."""
    try:
        # Zavolaj servisnú metódu na vymazanie
        ExpenseService.delete_expense_by_id(expense_id)
        # Ak prebehlo bez chyby, vráti prázdnu odpoveď s kódom 204 No Content
        return '', 204
    except ExpenseNotFoundError as e:
        # Ak služba hlási, že ID neexistuje
        return jsonify({"error": str(e)}), 404
    except ExpenseServiceError as e:
        # Iná chyba zo služby
        return jsonify({"error": str(e)}), 500
    except Exception as e:
         # Neočakávaná chyba
         print(f"Unexpected error in delete_expense_route: {e}")
         return jsonify({"error": "Internal server error"}), 500