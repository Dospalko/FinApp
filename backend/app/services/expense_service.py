from ..database import db
from ..models import Expense

class ExpenseServiceError(Exception): pass
class ExpenseNotFoundError(ExpenseServiceError): pass

class ExpenseService:
    @staticmethod
    def get_all_expenses(user_id):
        try:
            return Expense.query.filter_by(user_id=user_id).order_by(Expense.date_created.desc()).all()
        except Exception as e:
            print(f"DB error getting expenses for user {user_id}: {e}")
            raise ExpenseServiceError("Nepodarilo sa načítať výdavky.") from e

    @staticmethod
    def add_new_expense(expense_object, user_id):
        expense_object.user_id = user_id
        try:
            db.session.add(expense_object)
            db.session.commit()
            return expense_object
        except Exception as e:
            db.session.rollback()
            print(f"DB error adding expense for user {user_id}: {e}")
            raise ExpenseServiceError("Nepodarilo sa pridať výdavok.") from e

    @staticmethod
    def get_expense_by_id(expense_id, user_id):
        try:
            expense = db.session.get(Expense, expense_id)
            if not expense:
                raise ExpenseNotFoundError(f"Výdavok s ID {expense_id} nebol nájdený.")
            if expense.user_id != user_id:
                raise ExpenseNotFoundError(f"Výdavok s ID {expense_id} nebol nájdený (pre tohto používateľa).")
            return expense
        except ExpenseNotFoundError: raise
        except Exception as e:
            print(f"DB error retrieving expense {expense_id} for user {user_id}: {e}")
            raise ExpenseServiceError("Chyba pri načítaní výdavku.") from e

    @staticmethod
    def update_expense(expense_id, update_payload, user_id):
        try:
            expense_to_update = ExpenseService.get_expense_by_id(expense_id, user_id)
            expense_to_update.description = update_payload.description
            expense_to_update.amount = update_payload.amount
            if hasattr(update_payload, 'category'):
                 expense_to_update.category = update_payload.category
            if hasattr(update_payload, 'rule_category'):
                expense_to_update.rule_category = update_payload.rule_category
            db.session.commit()
            return expense_to_update
        except ExpenseNotFoundError: raise
        except Exception as e:
            db.session.rollback()
            print(f"DB error updating expense {expense_id} for user {user_id}: {e}")
            raise ExpenseServiceError(f"Nepodarilo sa aktualizovať výdavok s ID {expense_id}.") from e

    @staticmethod
    def delete_expense_by_id(expense_id, user_id):
        try:
            expense_to_delete = ExpenseService.get_expense_by_id(expense_id, user_id)
            db.session.delete(expense_to_delete)
            db.session.commit()
            return True
        except ExpenseNotFoundError: raise
        except Exception as e:
            db.session.rollback()
            print(f"DB error deleting expense {expense_id} for user {user_id}: {e}")
            raise ExpenseServiceError(f"Nepodarilo sa vymazať výdavok s ID {expense_id}.") from e