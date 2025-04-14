# backend/app/services/report_service.py
import datetime, random
from ..models.weekly_focus import WeeklyFocus
from ..database import db

class ReportServiceError(Exception):
    pass

class ReportService:
    @staticmethod
    def get_weekly_snapshot(user_id):
        """
        Vráti týždenný prehľad pre daného používateľa.
        Tu je to zatiaľ nasimulované náhodnými dátami (ako v tvojom frontende).
        V reálnej aplikácii by si tu z databázy čítal sumu príjmov/výdavkov.
        """
        # Môžeš zistiť minulotýždňový rozsah (start_date, end_date)
        # a následne vyťahovať sumy z tabuliek Expense, Income atď.
        # Nižšie len generujeme dummy:
        start_date_last_week = (datetime.date.today() - datetime.timedelta(days=7)).strftime('%Y-%m-%d')
        end_date_last_week   = (datetime.date.today() - datetime.timedelta(days=1)).strftime('%Y-%m-%d')

        snapshot = {
            "start_date_last_week": start_date_last_week,
            "end_date_last_week": end_date_last_week,
            "total_income_last_week": random.random() * 500 + 200,
            "total_expenses_last_week": random.random() * 400 + 50,
            "net_flow_last_week": (random.random() * 300) - 100,
            "biggest_expense": {
                "description": "Veľký nákup v Bille",
                "amount": random.random() * 50 + 40
            },
            "top_spending_categories": [
                { "category": "Potraviny", "amount": random.random() * 100 + 30 },
                { "category": "Reštaurácie a Kaviarne", "amount": random.random() * 50 + 10 },
                { "category": "Doprava", "amount": random.random() * 30 + 5 }
            ],
            "current_focus": None  # Ak chceš vrátiť aktuálny fokus, môžeš vyčítať z DB WeeklyFocus
        }

        # Ak to chceš vylepšiť, kľudne tu do snapshotu pribaľ reálny "focus" pre usera
        # latest_focus = WeeklyFocus.query.filter_by(user_id=user_id).order_by(WeeklyFocus.id.desc()).first()
        # snapshot["current_focus"] = latest_focus.focus_text if latest_focus else None

        return snapshot

    @staticmethod
    def set_weekly_focus(user_id, focus_text):
        """
        Uloží (alebo aktualizuje) WeeklyFocus do databázy. 
        Tu je to len príklad, môžeš to upraviť podľa svojich potrieb.
        """
        if not focus_text:
            raise ReportServiceError("No focus text provided.")

        new_focus = WeeklyFocus(
            user_id=user_id,
            focus_text=focus_text,
            date_set=datetime.datetime.utcnow()
        )
        db.session.add(new_focus)
        db.session.commit()

        return new_focus
