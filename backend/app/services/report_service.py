# backend/app/services/report_service.py
from datetime import datetime, timedelta, timezone, date
from sqlalchemy import func, and_, desc, extract, DateTime, Date as SQLDate
from ..models import Expense, Income, WeeklyFocus
from ..database import db
import traceback
from decimal import Decimal, InvalidOperation

class ReportServiceError(Exception): pass

class ReportService:

    @staticmethod
    def _get_last_7_days_range():
        today = datetime.now(timezone.utc).date()
        end_date = today
        start_date = today - timedelta(days=6)
        print(f"DEBUG: Calculating last 7 days range: {start_date.isoformat()} to {end_date.isoformat()}")
        return start_date, end_date

    @staticmethod
    def _get_current_week_start_date():
         today = datetime.now(timezone.utc).date()
         start_of_current_week = today - timedelta(days=today.weekday())
         return start_of_current_week

    @staticmethod
    def get_weekly_snapshot(user_id):
        try:
            start_date, end_date = ReportService._get_last_7_days_range()
            start_datetime = datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc)
            end_datetime = datetime.combine(end_date, datetime.max.time(), tzinfo=timezone.utc)
            print(f"DEBUG: Filtering data between {start_datetime.isoformat()} and {end_datetime.isoformat()}")

            print(f"DEBUG: Querying expenses for user {user_id}...")
            expenses_query = Expense.query.filter(
                Expense.user_id == user_id,
                Expense.date_created >= start_datetime,
                Expense.date_created <= end_datetime
            )
            expenses_last_7_days = expenses_query.all()
            print(f"DEBUG: Found {len(expenses_last_7_days)} expenses in the range.")
            for i, exp in enumerate(expenses_last_7_days[:3]):
                 print(f"DEBUG: Expense {i+1}: ID={exp.id}, Date={exp.date_created}, Amount={exp.amount}")

            print(f"DEBUG: Querying incomes for user {user_id}...")
            income_date_column = getattr(Income, 'date_created', getattr(Income, 'date', None))
            if income_date_column is None: raise ReportServiceError("Income model nemá dátumový stĺpec.")
            print(f"DEBUG: Using Income date column: {income_date_column.key}")
            is_datetime_col = isinstance(income_date_column.type, DateTime)
            incomes_query = Income.query.filter(
                Income.user_id == user_id,
                income_date_column >= start_datetime if is_datetime_col else income_date_column >= start_date,
                income_date_column <= end_datetime if is_datetime_col else income_date_column <= end_date
            )
            incomes_last_7_days = incomes_query.all()
            print(f"DEBUG: Found {len(incomes_last_7_days)} incomes in the range.")
            for i, inc in enumerate(incomes_last_7_days[:3]):
                 date_val = getattr(inc, income_date_column.key, None)
                 print(f"DEBUG: Income {i+1}: ID={inc.id}, Date={date_val}, Amount={inc.amount}")

            expense_amounts = [e.amount for e in expenses_last_7_days if e.amount is not None]
            income_amounts = [i.amount for i in incomes_last_7_days if i.amount is not None]
            print(f"DEBUG: Expense amounts to sum: {expense_amounts}")
            print(f"DEBUG: Income amounts to sum: {income_amounts}")
            total_expenses_dec = sum((Decimal(str(a)) for a in expense_amounts), Decimal(0))
            total_income_dec = sum((Decimal(str(a)) for a in income_amounts), Decimal(0))
            print(f"DEBUG: Calculated sums: Income={total_income_dec}, Expenses={total_expenses_dec}")
            net_flow_dec = total_income_dec - total_expenses_dec

            categories = {}
            for expense in expenses_last_7_days:
                cat = expense.category or "Nezaradené"
                categories[cat] = categories.get(cat, Decimal(0)) + (Decimal(str(expense.amount)) if expense.amount is not None else Decimal(0))
            top_spending_categories = sorted( [{"category": cat, "amount": float(amount.quantize(Decimal('0.01')))} for cat, amount in categories.items()], key=lambda x: x['amount'], reverse=True )[:3]

            biggest_expense_obj = max(expenses_last_7_days, key=lambda x: x.amount or 0) if expenses_last_7_days else None
            biggest_expense_data = { "description": biggest_expense_obj.description, "amount": float(Decimal(str(biggest_expense_obj.amount or 0)).quantize(Decimal('0.01'))) } if biggest_expense_obj else None

            current_week_start = ReportService._get_current_week_start_date()
            print(f"DEBUG: Querying focus for week starting {current_week_start.isoformat()}")
            current_focus_obj = WeeklyFocus.query.filter_by( user_id=user_id, week_start_date=current_week_start ).order_by(desc(WeeklyFocus.date_set)).first()
            current_focus_text = current_focus_obj.focus_text if current_focus_obj else None
            print(f"DEBUG: Found focus: {current_focus_text}")

            result_data = {
                "start_date_range": start_date.isoformat(),
                "end_date_range": end_date.isoformat(),
                "total_income_last_period": float(total_income_dec.quantize(Decimal('0.01'))),
                "total_expenses_last_period": float(total_expenses_dec.quantize(Decimal('0.01'))),
                "net_flow_last_period": float(net_flow_dec.quantize(Decimal('0.01'))),
                "biggest_expense": biggest_expense_data,
                "top_spending_categories": top_spending_categories,
                "current_focus": current_focus_text
            }
            print(f"DEBUG: Returning snapshot data: {result_data}")
            return result_data

        except Exception as e:
            print(f"Error getting weekly snapshot User:{user_id}: {e}")
            traceback.print_exc()
            return { "error": "Nepodarilo sa získať týždenný prehľad." }

    @staticmethod
    def set_weekly_focus(user_id, focus_text):
        try:
            if not isinstance(focus_text, str) or not (0 <= len(focus_text) <= 255):
                 raise ValueError("Neplatný text fokusu.")
            current_week_start = ReportService._get_current_week_start_date()
            existing_focus = WeeklyFocus.query.with_for_update().filter_by( user_id=user_id, week_start_date=current_week_start ).first()
            if existing_focus:
                if not focus_text: db.session.delete(existing_focus); saved_focus = None
                else: existing_focus.focus_text = focus_text; existing_focus.date_set = datetime.now(timezone.utc); saved_focus = existing_focus
            elif focus_text:
                new_focus = WeeklyFocus(user_id=user_id, week_start_date=current_week_start, focus_text=focus_text)
                db.session.add(new_focus); saved_focus = new_focus
            else: saved_focus = None
            db.session.commit()
            return saved_focus
        except Exception as e:
            db.session.rollback(); print(f"Error setting weekly focus User:{user_id}: {e}"); traceback.print_exc()
            raise ReportServiceError("Nepodarilo sa uložiť týždenný fokus.") from e