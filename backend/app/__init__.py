# backend/app/__init__.py
import os
from flask import Flask
from flask_cors import CORS

from .config import Config
from .database import db, ma # Opravený import
from .errors import register_error_handlers
from .routes import all_blueprints # Opravený import

def create_app(config_class=Config):
    """Application Factory Function"""
    # Opravená cesta k instance priečinku
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    instance_path_abs = os.path.join(project_root, '..', 'instance')

    app = Flask(__name__, instance_relative_config=True, instance_path=instance_path_abs)
    app.config.from_object(config_class)

    print("--- Flask App Configuration ---")
    print(f"SECRET_KEY loaded: {'Yes' if app.config.get('SECRET_KEY') else 'No (Using default!)'}")
    print(f"SQLALCHEMY_DATABASE_URI: {app.config.get('SQLALCHEMY_DATABASE_URI')}")
    print(f"Instance Path: {app.instance_path}")
    print(f"CORS Origins: {os.environ.get('CORS_ORIGINS', 'http://localhost:5173')}")
    print("-----------------------------")

    # Inicializácia rozšírení
    db.init_app(app)
    ma.init_app(app)
    CORS(app,
         origins=os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(','),
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        )

   # Registrácia Blueprintov
    print("--- Registering Blueprints ---") # Pridaný výpis pre lepšie sledovanie
    for bp in all_blueprints:
        # === ZAČIATOK ZMENY ===
        # Bezpečnejšia kontrola, či má blueprint nejaké pravidlá
        # Skontrolujeme, či vôbec existuje nejaký endpoint pre daný blueprint
        has_rules = any(rule.endpoint.startswith(f"{bp.name}.") for rule in app.url_map.iter_rules())

        # Ak je to 'base' blueprint a NEMÁ žiadne pravidlá, preskočíme ho
        if bp.name == 'base' and not has_rules:
             print(f"Skipping registration of Blueprint '{bp.name}' as it has no routes.")
             continue
        # === KONIEC ZMENY ===

        url_prefix = '/api' if bp.name != 'base' else None
        try:
            app.register_blueprint(bp, url_prefix=url_prefix)
            print(f"Registered Blueprint: '{bp.name}' at prefix: {url_prefix or '/'}")
        except Exception as e:
            print(f"!!! Error registering blueprint '{bp.name}': {e}") # Výpis chyby pri registrácii

    print("--- Blueprint registration finished ---")


    # Registrácia error handlerov
    register_error_handlers(app)
    print("Error handlers registered.")


    # CLI príkazy
    register_cli_commands(app)
    print("CLI commands registered.")

    return app


def register_cli_commands(app):
    """Registruje CLI príkazy pre Flask."""
    @app.cli.command('init-db')
    def init_db_command():
        """Vytvorí databázové tabuľky definované v modeloch."""
        print("Initializing the database...")
        # Získanie cesty z configu
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        if db_uri.startswith('sqlite:///'):
             db_path = db_uri.split('///')[1]
             instance_dir = os.path.dirname(db_path)
             if not os.path.exists(instance_dir):
                 try:
                     os.makedirs(instance_dir)
                     print(f"Created instance directory: {instance_dir}")
                 except OSError as e:
                     print(f"Error creating instance directory {instance_dir}: {e}")
                     return

        with app.app_context():
             try:
                 db.create_all()
                 print("Database tables created successfully (if they didn't exist).")
             except Exception as e:
                 print(f"Error creating database tables: {e}")

    @app.cli.command('seed-db')
    def seed_db_command():
         """Naplní databázu vzorovými dátami (ak je prázdna)."""
         print("Attempting to seed database...")
         with app.app_context():
             from .models import Expense # Relatívny import v CLI
             if Expense.query.first():
                  print("Database already contains data. Skipping seed.")
                  return
             try:
                 print("Seeding database with sample data...")
                 expense1 = Expense(description="Potraviny Lidl", amount=42.10, category="Potraviny")
                 expense2 = Expense(description="Mesačný lístok MHD", amount=25.00, category="Doprava")
                 expense3 = Expense(description="Kino", amount=8.50, category="Zábava")
                 db.session.add_all([expense1, expense2, expense3])
                 db.session.commit()
                 print("Database seeded successfully.")
             except Exception as e:
                 db.session.rollback()
                 print(f"Error seeding database: {e}")

    @app.cli.command('list-routes')
    def list_routes_command():
        """Vypíše všetky dostupné routy v aplikácii."""
        import urllib
        output = []
        for rule in app.url_map.iter_rules():
            options = {}
            for arg in rule.arguments:
                options[arg] = f"[{arg}]"

            methods = ','.join(sorted(rule.methods))
            # Ignore OPTIONS a HEAD metódy pre prehľadnosť
            relevant_methods = {m for m in methods.split(',') if m not in ['OPTIONS', 'HEAD']}
            if not relevant_methods:
                continue # Preskoč pravidlá len s OPTIONS/HEAD
            methods_str = ','.join(sorted(list(relevant_methods)))

            url = urllib.parse.unquote(rule.rule)
            line = f"{rule.endpoint:35s} {methods_str:25s} {url}"
            output.append(line)

        print("\n--- Available Application Routes ---")
        for line in sorted(output):
            print(line)
        print("------------------------------------\n")