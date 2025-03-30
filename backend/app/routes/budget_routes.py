# backend/app/routes/budget_routes.py
from flask import Blueprint, request, jsonify
from ..schemas import budget_schema, budgets_schema, budget_input_schema
from ..services import BudgetService, BudgetServiceError, BudgetNotFoundError
# Importuj IncomeService na získanie celkových príjmov
from ..services import IncomeService, IncomeServiceError as IncomeServiceErr
# Importuj model Income pre dopyt
from ..models import Income
from marshmallow import ValidationError
from datetime import datetime
# === PRIDANÝ POTREBNÝ IMPORT ===
from sqlalchemy import extract
# === KONIEC IMPORTU ===

budget_bp = Blueprint('budgets', __name__)

# --- Routa pre /budgets (GET - zoznam, POST - nastaviť/upraviť) ---
@budget_bp.route('/budgets', methods=['GET', 'POST'])
def handle_budgets():
    if request.method == 'POST':
        # --- Logika pre POST (nastavenie/update) ---
        json_data = request.get_json()
        if not json_data: return jsonify({"error": "No input data"}), 400
        try:
            budget_object = budget_input_schema.load(json_data)
        except ValidationError as err:
            return jsonify({"error": "Invalid input", "messages": err.messages}), 400
        try:
            saved_budget = BudgetService.set_or_update_budget(budget_object)
            return jsonify(budget_schema.dump(saved_budget)), 201
        except BudgetServiceError as e: return jsonify({"error": str(e)}), 500
        except Exception as e:
            print(f"Unexpected error in handle_budgets (POST): {e}")
            return jsonify({"error": "Internal server error"}), 500
    else: # request.method == 'GET'
        # --- Logika pre GET (zoznam rozpočtov pre mesiac) ---
        try:
            year = int(request.args.get('year', datetime.now().year))
            month = int(request.args.get('month', datetime.now().month))
        except ValueError:
            return jsonify({"error": "Invalid year or month parameter"}), 400
        try:
            budgets = BudgetService.get_budgets_for_month(year, month)
            return jsonify(budgets_schema.dump(budgets)), 200
        except BudgetServiceError as e: return jsonify({"error": str(e)}), 500
        except Exception as e:
            print(f"Unexpected error in handle_budgets (GET): {e}")
            return jsonify({"error": "Internal server error"}), 500

# --- Routa pre /budget-status (GET - stav čerpania) ---
@budget_bp.route('/budget-status', methods=['GET'])
def get_budget_status():
    try:
        year = int(request.args.get('year', datetime.now().year))
        month = int(request.args.get('month', datetime.now().month))
    except ValueError:
        return jsonify({"error": "Invalid year or month parameter"}), 400
    try:
        status = BudgetService.get_budget_status_for_month(year, month)
        return jsonify(status), 200
    except BudgetServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error getting budget status: {e}")
        return jsonify({"error": "Internal server error"}), 500

# --- Routa pre /budget-rules-status (GET - stav 50/30/20) ---
@budget_bp.route('/budget-rules-status', methods=['GET'])
def get_rules_status():
    try:
        year = int(request.args.get('year', datetime.now().year))
        month = int(request.args.get('month', datetime.now().month))
    except ValueError:
        return jsonify({"error": "Invalid year or month parameter"}), 400
    try:
        # 1. Získaj príjmy pre daný mesiac (už pomocou extract)
        # Používame Income.date_created, uisti sa, že model to má takto
        monthly_incomes = Income.query.filter(
            extract('year', Income.date_created) == year,
            extract('month', Income.date_created) == month
        ).all()
        total_income = sum(inc.amount for inc in monthly_incomes)

        # 2. Získaj stav 50/30/20 zo servisu
        status = BudgetService.get_50_30_20_status(year, month, total_income)
        return jsonify(status), 200
    except (BudgetServiceError, IncomeServiceErr) as e: # Zachytávame chyby z oboch servisov
         print(f"Service error getting rules status: {e}")
         return jsonify({"error": str(e)}), 500
    except Exception as e:
        # Zachytávame aj neočakávané chyby (napr. problém s DB pri načítaní príjmov)
        print(f"Unexpected error getting rules status: {e}")
        return jsonify({"error": "Internal server error"}), 500