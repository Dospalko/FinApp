from ..database import db
from ..models import Budget, Expense, Income
from sqlalchemy import extract, func, and_

class BudgetServiceError(Exception): pass
class BudgetNotFoundError(BudgetServiceError): pass

class BudgetService:
    @staticmethod
    def get_budgets_for_month(year, month, user_id):
        try:
            return Budget.query.filter_by(year=year, month=month, user_id=user_id).all()
        except Exception as e:
            print(f"DB error getting budgets for {month}/{year} user {user_id}: {e}")
            raise BudgetServiceError("Nepodarilo sa načítať rozpočty.") from e

    @staticmethod
    def set_or_update_budget(budget_object, user_id):
        budget_object.user_id = user_id
        existing_budget = Budget.query.filter_by(
            category=budget_object.category,
            month=budget_object.month,
            year=budget_object.year,
            user_id=user_id
        ).first()

        try:
            if existing_budget:
                existing_budget.amount = budget_object.amount
                db.session.commit()
                return existing_budget
            else:
                db.session.add(budget_object)
                db.session.commit()
                return budget_object
        except Exception as e:
            db.session.rollback()
            print(f"Error setting/updating budget for user {user_id}: {e}")
            raise BudgetServiceError("Nepodarilo sa uložiť rozpočet.") from e

    @staticmethod
    def get_budget_status_for_month(year, month, user_id):
        try:
            budgets = BudgetService.get_budgets_for_month(year, month, user_id)
        except BudgetServiceError as e: raise e
        except Exception as e:
             print(f"Unexpected error fetching budgets in get_budget_status for user {user_id}: {e}")
             raise BudgetServiceError("Nastala neočakávaná chyba pri načítaní rozpočtov.") from e

        status_list = []
        if not budgets: return status_list

        try:
            all_expenses_for_month = db.session.query(
                Expense.category,
                func.sum(Expense.amount).label('total_spent')
            ).filter(
                Expense.user_id == user_id, # Filter by user
                extract('year', Expense.date_created) == year,
                extract('month', Expense.date_created) == month,
                Expense.category.in_([b.category for b in budgets])
            ).group_by(Expense.category).all()

            spent_map = {category: total_spent for category, total_spent in all_expenses_for_month}

            for budget in budgets:
                spent_amount = spent_map.get(budget.category, 0.0)
                remaining = budget.amount - spent_amount
                percentage = (spent_amount / budget.amount * 100) if budget.amount > 0 else 0
                status_list.append({
                    'id': budget.id,
                    'category': budget.category,
                    'budgeted_amount': round(budget.amount, 2),
                    'spent_amount': round(spent_amount, 2),
                    'remaining_amount': round(remaining, 2),
                    'percentage_spent': round(percentage, 1)
                })
            return status_list
        except Exception as e:
            print(f"Error calculating budget status spending for user {user_id}: {e}")
            raise BudgetServiceError("Nepodarilo sa vypočítať čerpanie rozpočtov.") from e

    @staticmethod
    def get_50_30_20_status(year, month, total_income, user_id):
         default_status = {
                 'needs': {'budgeted_percent': 50, 'spent_percent': 0, 'spent_amount': 0},
                 'wants': {'budgeted_percent': 30, 'spent_percent': 0, 'spent_amount': 0},
                 'savings_expenses': {'budgeted_percent': 20, 'spent_percent': 0, 'spent_amount': 0},
                 'unclassified_amount': 0,
                 'total_income': round(total_income, 2)
             }
         if total_income <= 0: return default_status

         try:
             spending_by_rule = db.session.query(
                 Expense.rule_category,
                 func.sum(Expense.amount).label('total_spent')
             ).filter(
                 Expense.user_id == user_id, # Filter by user
                 extract('year', Expense.date_created) == year,
                 extract('month', Expense.date_created) == month
             ).group_by(Expense.rule_category).all()

             spent_map = {rule: total for rule, total in spending_by_rule if rule}
             unclassified_spent = sum(total for rule, total in spending_by_rule if not rule)
             needs_spent = spent_map.get('Needs', 0.0)
             wants_spent = spent_map.get('Wants', 0.0)
             savings_spent_as_expense = spent_map.get('Savings', 0.0)

             return {
                 'needs': {
                     'budgeted_percent': 50,
                     'spent_percent': round((needs_spent / total_income) * 100, 1) if total_income > 0 else 0,
                     'spent_amount': round(needs_spent, 2)
                 },
                 'wants': {
                     'budgeted_percent': 30,
                     'spent_percent': round((wants_spent / total_income) * 100, 1) if total_income > 0 else 0,
                     'spent_amount': round(wants_spent, 2)
                 },
                 'savings_expenses': {
                     'budgeted_percent': 20,
                     'spent_percent': round((savings_spent_as_expense / total_income) * 100, 1) if total_income > 0 else 0,
                     'spent_amount': round(savings_spent_as_expense, 2)
                 },
                 'unclassified_amount': round(unclassified_spent, 2),
                 'total_income': round(total_income, 2)
             }
         except Exception as e:
             print(f"Error calculating 50/30/20 status spending for user {user_id}: {e}")
             return default_status