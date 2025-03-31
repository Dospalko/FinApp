from flask import Blueprint, request, jsonify, g
from ..schemas import budget_schema, budgets_schema, budget_input_schema
from ..services import BudgetService, BudgetServiceError, BudgetNotFoundError
from ..services import IncomeService, IncomeServiceError as IncomeServiceErr
from ..models import Income
from ..utils.auth_utils import token_required
from marshmallow import ValidationError
from datetime import datetime
from sqlalchemy import extract

budget_bp = Blueprint('budgets', __name__)

@budget_bp.route('/budgets', methods=['GET'])
@token_required
def get_budgets_route():
    user_id = g.current_user.id
    try:
        year = int(request.args.get('year', datetime.now().year))
        month = int(request.args.get('month', datetime.now().month))
    except ValueError: return jsonify({"error": "Invalid year or month"}), 400
    try:
        budgets = BudgetService.get_budgets_for_month(year, month, user_id=user_id)
        return jsonify(budgets_schema.dump(budgets)), 200
    except BudgetServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error in get_budgets_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@budget_bp.route('/budgets', methods=['POST'])
@token_required
def set_budget_route():
    user_id = g.current_user.id
    json_data = request.get_json()
    if not json_data: return jsonify({"error": "No input data"}), 400
    try:
        budget_object = budget_input_schema.load(json_data)
    except ValidationError as err: return jsonify({"error": "Invalid input", "messages": err.messages}), 400
    try:
        saved_budget = BudgetService.set_or_update_budget(budget_object, user_id=user_id)
        return jsonify(budget_schema.dump(saved_budget)), 201
    except BudgetServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error in set_budget_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@budget_bp.route('/budget-status', methods=['GET'])
@token_required
def get_budget_status_route():
    user_id = g.current_user.id
    try:
        year = int(request.args.get('year', datetime.now().year))
        month = int(request.args.get('month', datetime.now().month))
    except ValueError: return jsonify({"error": "Invalid year or month"}), 400
    try:
        status = BudgetService.get_budget_status_for_month(year, month, user_id=user_id)
        return jsonify(status), 200
    except BudgetServiceError as e: return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error in get_budget_status_route: {e}"); return jsonify({"error": "Internal server error"}), 500

@budget_bp.route('/budget-rules-status', methods=['GET'])
@token_required
def get_rules_status_route():
    user_id = g.current_user.id
    try:
        year = int(request.args.get('year', datetime.now().year))
        month = int(request.args.get('month', datetime.now().month))
    except ValueError: return jsonify({"error": "Invalid year or month"}), 400
    try:
        monthly_incomes = Income.query.filter(
            Income.user_id == user_id,
            extract('year', Income.date_created) == year,
            extract('month', Income.date_created) == month
        ).all()
        total_income = sum(inc.amount for inc in monthly_incomes)
        status = BudgetService.get_50_30_20_status(year, month, total_income, user_id=user_id)
        return jsonify(status), 200
    except (BudgetServiceError, IncomeServiceErr) as e:
         print(f"Service error getting rules status: {e}"); return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"Unexpected error getting rules status: {e}"); return jsonify({"error": "Internal server error"}), 500