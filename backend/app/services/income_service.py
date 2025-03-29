# backend/app/services/income_service.py
from ..database import db
from ..models.income import Income # Importuj Income model
# Môžeš použiť rovnaké alebo vytvoriť špecifické výnimky
from .expense_service import ExpenseServiceError as IncomeServiceError
from .expense_service import ExpenseNotFoundError as IncomeNotFoundError

class IncomeService:
    @staticmethod
    def get_all_incomes():
        """Získa všetky príjmy zoradené podľa dátumu."""
        try:
            return Income.query.order_by(Income.date_received.desc()).all()
        except Exception as e:
            print(f"Database error retrieving incomes: {e}")
            raise IncomeServiceError("Nepodarilo sa načítať príjmy z databázy.") from e

    @staticmethod
    def add_new_income(income_object):
        """Pridá nový príjem (už ako objekt Income) do databázy."""
        try:
            db.session.add(income_object)
            db.session.commit()
            return income_object
        except Exception as e:
            db.session.rollback()
            print(f"Database error adding income: {e}")
            raise IncomeServiceError("Nepodarilo sa pridať príjem do databázy.") from e

    @staticmethod
    def get_income_by_id(income_id):
         """Získa jeden príjem podľa ID."""
         try:
             income = db.session.get(Income, income_id)
             if not income:
                 raise IncomeNotFoundError(f"Príjem s ID {income_id} nebol nájdený.")
             return income
         except IncomeNotFoundError:
             raise
         except Exception as e:
             print(f"Database error retrieving income ID {income_id}: {e}")
             raise IncomeServiceError(f"Chyba pri načítaní príjmu s ID {income_id}.") from e

    @staticmethod
    def delete_income_by_id(income_id):
        """Vymaže príjem podľa ID."""
        try:
            income_to_delete = IncomeService.get_income_by_id(income_id)
            db.session.delete(income_to_delete)
            db.session.commit()
            return True
        except IncomeNotFoundError:
             raise
        except Exception as e:
            db.session.rollback()
            print(f"Database error deleting income ID {income_id}: {e}")
            raise IncomeServiceError(f"Nepodarilo sa vymazať príjem s ID {income_id}.") from e