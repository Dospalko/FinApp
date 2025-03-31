# backend/app/utils/auth_utils.py
import jwt
from functools import wraps
from flask import request, jsonify, current_app, g
from ..database import db
from ..models import User
import datetime

def generate_token(user_id):
    """Generuje JWT token."""
    try:
        payload = {
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=current_app.config['JWT_ACCESS_TOKEN_EXPIRES_SECONDS']),
            'iat': datetime.datetime.now(datetime.timezone.utc),
            # === OPRAVA: Prevod ID na string ===
            'sub': str(user_id) # <<< Konvertuj user_id na string
            # ==================================
        }
        return jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm='HS256'
        )
    except Exception as e:
        print(f"Error generating token: {e}")
        return None

# --- verify_token zostáva rovnaká, ale očakáva string ---
def verify_token(token):
     """Overí JWT token a vráti user ID (ako integer)."""
     try:
         payload = jwt.decode(
             token,
             current_app.config['JWT_SECRET_KEY'],
             algorithms=['HS256']
         )
         user_id_str = payload.get('sub')
         # === OPRAVA: Konverzia späť na integer ===
         if user_id_str:
             return int(user_id_str) # <<< Konvertuj string ID späť na integer
         else:
             return None
         # =======================================
     except jwt.ExpiredSignatureError:
         print("Token expired.")
         return None
     except jwt.InvalidTokenError as e:
         print(f"Invalid token: {e}")
         return None
     # Pridáme odchyt ValueError pri konverzii na int
     except ValueError:
         print("Invalid subject format in token (not an integer).")
         return None
     except Exception as e:
         print(f"Error verifying token: {e}")
         return None

# --- token_required zostáva rovnaká ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        if not token: return jsonify({'error': 'Unauthorized', 'message': 'Token is missing!'}), 401

        user_id = verify_token(token) # Získa ID už ako integer
        if not user_id: return jsonify({'error': 'Unauthorized', 'message': 'Token is invalid or expired!'}), 401

        # Načítanie usera pomocou integer ID
        current_user = db.session.get(User, user_id)
        if not current_user: return jsonify({'error': 'Unauthorized', 'message': 'User not found!'}), 401

        g.current_user = current_user
        return f(*args, **kwargs)
    return decorated