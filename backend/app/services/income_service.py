# backend/app/services/income_service.py
from ..database import db
from ..models.income import Income
# Radšej definujme vlastné výnimky
class IncomeServiceError(Exception): pass
class IncomeNotFoundError(IncomeServiceError): pass

class IncomeService:
    @staticmethod
    def get_all_incomes():
        try:
            # Zoradenie podľa date_created
            return Income.query.order_by(Income.date_created.desc()).all()
        except Exception as e:
            print(f"Database error retrieving incomes: {e}")
            raise IncomeServiceError("Nepodarilo sa načítať príjmy.") from e

    @staticmethod
    def add_new_income(income_object): # Očakáva objekt zo schémy
        try:
            db.session.add(income_object)
            db.session.commit()
            return income_object
        except Exception as e:
            db.session.rollback()
            print(f"Database error adding income: {e}")
            raise IncomeServiceError("Nepodarilo sa pridať príjem.") from e

    @staticmethod
    def get_income_by_id(income_id):
         try:
             income = db.session.get(Income, income_id)
             if not income:
                 raise IncomeNotFoundError(f"Príjem s ID {income_id} nebol nájdený.")
             return income
         except IncomeNotFoundError: raise
         except Exception as e:
             print(f"Database error retrieving income ID {income_id}: {e}")
             raise IncomeServiceError(f"Chyba pri načítaní príjmu s ID {income_id}.") from e

    # --- NOVÁ METÓDA pre UPDATE ---
    @staticmethod
    def update_income(income_id, update_payload): # update_payload je objekt zo schémy
        try:
            income_to_update = IncomeService.get_income_by_id(income_id)

            # Skopíruj validované hodnoty
            income_to_update.description = update_payload.description
            income_to_update.amount = update_payload.amount
            # source je nepovinný, prenes hodnotu ak existuje v payloade
            if hasattr(update_payload, 'source'):
                income_to_update.source = update_payload.source

            db.session.commit()
            return income_to_update
        except IncomeNotFoundError: raise
        except Exception as e:
            db.session.rollback()
            print(f"Database error updating income ID {income_id}: {e}")
            raise IncomeServiceError(f"Nepodarilo sa aktualizovať príjem s ID {income_id}.") from e
    # --- KONIEC NOVEJ METÓDY ---

    @staticmethod
    def delete_income_by_id(income_id):
        try:
            income_to_delete = IncomeService.get_income_by_id(income_id)
            db.session.delete(income_to_delete)
            db.session.commit()
            return True
        except IncomeNotFoundError: raise
        except Exception as e:
            db.session.rollback()
            print(f"Database error deleting income ID {income_id}: {e}")
            raise IncomeServiceError(f"Nepodarilo sa vymazať príjem s ID {income_id}.") from e