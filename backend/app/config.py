# backend/app/config.py
import os
from dotenv import load_dotenv

# Cesta k .env súboru v HLAVNOM priečinku projektu (o 2 úrovne vyššie)
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
flask_dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.flaskenv')

# Skús načítať .flaskenv prioritne, potom .env
if os.path.exists(flask_dotenv_path):
    load_dotenv(dotenv_path=flask_dotenv_path, override=True) # override=True zabezpečí, že .flaskenv prepíše .env
    print(f".flaskenv loaded from: {flask_dotenv_path}")
elif os.path.exists(dotenv_path):
     load_dotenv(dotenv_path=dotenv_path)
     print(f".env loaded from: {dotenv_path}")
else:
    print(f"No .env or .flaskenv file found in project root.")


# Absolútna cesta k priečinku, kde je tento config.py (t.j. backend/app)
basedir = os.path.abspath(os.path.dirname(__file__))
# Cesta k 'instance' priečinku (o dve úrovne vyššie ako 'app' a potom do 'instance')
project_root = os.path.dirname(os.path.dirname(basedir)) # Toto je finance_tracker priečinok
instance_path = os.path.join(project_root, 'instance')

class Config:
    """Základná konfigurácia aplikácie."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'zmen-tento-velmi-tajny-kluc-v-produkcii'

    # Cesta k SQLite databáze v 'instance' priečinku
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(instance_path, 'tracker.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Zaistenie existencie 'instance' priečinka (Flask to vie urobiť sám, ale istota je istota)
    if not os.path.exists(instance_path):
        try:
            os.makedirs(instance_path)
            print(f"Created instance directory: {instance_path}")
        except OSError as e:
            print(f"Error creating instance directory {instance_path}: {e}")