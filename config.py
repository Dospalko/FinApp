import os
from dotenv import load_dotenv

# Načítanie premenných z .env súboru (ak existuje)
load_dotenv()

# Absolútna cesta k priečinku, kde je tento config.py
basedir = os.path.abspath(os.path.dirname(__file__))
# Cesta k 'instance' priečinku
instance_path = os.path.join(basedir, 'instance')

class Config:
    """Základná konfigurácia aplikácie."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-tajny-kluc-zmen-ma'

    # Cesta k SQLite databáze v 'instance' priečinku
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(instance_path, 'tracker.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Zaistenie existencie 'instance' priečinka
    if not os.path.exists(instance_path):
        try:
            os.makedirs(instance_path)
            print(f"Vytvorený priečinok: {instance_path}")
        except OSError as e:
            print(f"Chyba pri vytváraní priečinka {instance_path}: {e}")