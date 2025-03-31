from ..database import db
from ..models import Income

class IncomeServiceError(Exception): pass
class IncomeNotFoundError(IncomeServiceError): pass

class IncomeService:
    @staticmethod
    def get_all_incomes(user_id):
        try:
            return Income.query.filter_by(user_id=user_id).order_by(Income.date_created.desc()).all()
        except Exception as e:
            print(f"DB error retrieving incomes for user {user_id}: {e}")
            raise IncomeServiceError("Nepodarilo sa načítať príjmy.") from e

    @staticmethod
    def add_new_income(income_object, user_id):
        income_object.user_id = user_id
        try:
            db.session.add(income_object)
            db.session.commit()
            return income_object
        except Exception as e:
            db.session.rollback()
            print(f"DB error adding income for user {user_id}: {e}")
            raise IncomeServiceError("Nepodarilo sa pridať príjem.") from e

    @staticmethod
    def get_income_by_id(income_id, user_id):
        try:
            income = db.session.get(Income, income_id)
            if not income:
                raise IncomeNotFoundError(f"Príjem s ID {income_id} nebol nájdený.")
            if income.user_id != user_id:
                raise IncomeNotFoundError(f"Príjem s ID {income_id} nebol nájdený (pre tohto používateľa).")
            return income
        except IncomeNotFoundError: raise
        except Exception as e:
            print(f"DB error retrieving income {income_id} for user {user_id}: {e}")
            raise IncomeServiceError("Chyba pri načítaní príjmu.") from e

    @staticmethod
    def update_income(income_id, update_payload, user_id):
        try:
            income_to_update = IncomeService.get_income_by_id(income_id, user_id)
            income_to_update.description = update_payload.description
            income_to_update.amount = update_payload.amount
            if hasattr(update_payload, 'source'):
                income_to_update.source = update_payload.source
            db.session.commit()
            return income_to_update
        except IncomeNotFoundError: raise
        except Exception as e:
            db.session.rollback()
            print(f"DB error updating income {income_id} for user {user_id}: {e}")
            raise IncomeServiceError(f"Nepodarilo sa aktualizovať príjem s ID {income_id}.") from e

    @staticmethod
    def delete_income_by_id(income_id, user_id):
        try:
            income_to_delete = IncomeService.get_income_by_id(income_id, user_id)
            db.session.delete(income_to_delete)
            db.session.commit()
            return True
        except IncomeNotFoundError: raise
        except Exception as e:
            db.session.rollback()
            print(f"DB error deleting income {income_id} for user {user_id}: {e}")
            raise IncomeServiceError(f"Nepodarilo sa vymazať príjem s ID {income_id}.") from e