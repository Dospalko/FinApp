# backend/app/models/weekly_focus.py

from ..database import db
import datetime

class WeeklyFocus(db.Model):
    __tablename__ = 'weekly_focus'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    focus_text = db.Column(db.String(255), nullable=False)
    date_set = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Vzťah s modelom User
    user = db.relationship("User", backref="weekly_focuses", lazy="joined")

    def __repr__(self):
        return f"<WeeklyFocus id={self.id} user_id={self.user_id} focus_text={self.focus_text}>"
