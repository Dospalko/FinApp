# backend/app/models/weekly_focus.py
from ..database import db
from sqlalchemy import UniqueConstraint, ForeignKey, Date, DateTime, String, Integer
import datetime

class WeeklyFocus(db.Model):
    __tablename__ = 'weekly_focus'

    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(Integer, ForeignKey('user.id'), nullable=False)
    # Používame názov week_start_date, typ Date
    week_start_date = db.Column(Date, nullable=False)
    focus_text = db.Column(String(255), nullable=True)
    date_set = db.Column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))

    # Unikátny constraint používa správny názov stĺpca
    __table_args__ = (UniqueConstraint('user_id', 'week_start_date', name='uq_user_week_focus'),)

    def __repr__(self):
        return f'<WeeklyFocus User:{self.user_id} Week:{self.week_start_date} Focus:"{self.focus_text[:20]}...">'