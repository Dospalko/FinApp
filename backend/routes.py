from flask import Blueprint, jsonify, request
from .models import Expense
from . import db

bp = Blueprint('api', __name__) # Názov blueprintu

@bp.route('/expenses', methods=['GET'])
def get_expenses():
    """Získa všetky výdavky."""
    try:
        expenses = Expense.query.order_by(Expense.date_created.desc()).all()
        return jsonify([expense.to_dict() for expense in expenses])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/expenses', methods=['POST'])
def add_expense():
    """Pridá nový výdavok."""
    data = request.get_json()
    if not data or not 'description' in data or not 'amount' in data:
        return jsonify({"error": "Chýba popis alebo suma"}), 400

    try:
        new_expense = Expense(
            description=data['description'],
            amount=float(data['amount']),
            category=data.get('category') # Nepovinné pole
        )
        db.session.add(new_expense)
        db.session.commit()
        return jsonify(new_expense.to_dict()), 201 # 201 Created
    except ValueError:
        return jsonify({"error": "Neplatná hodnota pre sumu"}), 400
    except Exception as e:
        db.session.rollback() # Vrátiť zmeny v prípade chyby
        return jsonify({"error": str(e)}), 500

# Sem neskôr môžeš pridať ďalšie endpointy (mazanie, úprava, filtrovanie...)