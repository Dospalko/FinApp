import os
from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .database import db, ma
from .errors import register_error_handlers
from .routes import all_blueprints

def create_app(config_class=Config):
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    instance_path_abs = os.path.join(project_root, '..', 'instance')
    app = Flask(__name__, instance_relative_config=True, instance_path=instance_path_abs)
    app.config.from_object(config_class)

    # Updated CORS configuration
    CORS(app,
         resources={r"/api/*": {
             "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],  # Add both localhost variations
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"],  # Add expose_headers
             "max_age": 3600  # Cache preflight requests for 1 hour
         }},
         supports_credentials=True
    )

    db.init_app(app)
    ma.init_app(app)

    # Register blueprints with explicit prefixes
    for bp in all_blueprints:
        if bp.name == 'auth':
            app.register_blueprint(bp, url_prefix='/api/auth')
        elif bp.name == 'reports':
            # <-- DÔLEŽITÉ: Tvoj blueprint 'reports' dostane prefix /api/reports
            app.register_blueprint(bp, url_prefix='/api/reports')
        elif bp.name != 'base':
            # Všetky ostatné (okrem 'base') dostanú prefix /api
            app.register_blueprint(bp, url_prefix='/api')
        else:
            # 'base' blueprint ide bez prefixu
            app.register_blueprint(bp)

    register_error_handlers(app)
    return app

def register_cli_commands(app):
    @app.cli.command('init-db')
    def init_db_command():
        print("Initializing the database...")
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
                 print("Database tables created successfully.")
             except Exception as e:
                 print(f"Error creating database tables: {e}")

    @app.cli.command('seed-db')
    def seed_db_command():
         import datetime
         print("Attempting to seed database...")
         with app.app_context():
             from .models import User, Expense, Income, Budget # Importuj všetky modely
             # Seeduj len ak je tabuľka User prázdna
             if User.query.first():
                  print("Database already contains users. Skipping seed.")
                  return
             try:
                 print("Seeding database with sample user and data...")
                 # Vytvor usera
                 user1 = User(username="testuser", email="test@example.com")
                 user1.set_password("password")
                 db.session.add(user1)
                 db.session.commit() # Commitni usera, aby sme mali jeho ID

                 # Pridaj dáta pre usera 1
                 expense1 = Expense(description="Potraviny Tesco", amount=35.50, category="Potraviny", rule_category="Needs", author=user1)
                 expense2 = Expense(description="Lístok na autobus", amount=1.20, category="Doprava", rule_category="Needs", author=user1)
                 expense3 = Expense(description="Netflix", amount=9.99, category="Zábava", rule_category="Wants", author=user1)
                 income1 = Income(description="Výplata", amount=1500, source="Zamestnávateľ", recipient=user1)
                 budget1 = Budget(category="Potraviny", amount=200, month=datetime.datetime.now().month, year=datetime.datetime.now().year, owner=user1)
                 budget2 = Budget(category="Zábava", amount=100, month=datetime.datetime.now().month, year=datetime.datetime.now().year, owner=user1)

                 db.session.add_all([expense1, expense2, expense3, income1, budget1, budget2])
                 db.session.commit()
                 print("Database seeded successfully with user 'testuser' (pw: password) and sample data.")
             except Exception as e:
                 db.session.rollback()
                 print(f"Error seeding database: {e}")

    @app.cli.command('list-routes')
    def list_routes_command():
        import urllib
        output = []
        for rule in app.url_map.iter_rules():
            options = {}
            for arg in rule.arguments:
                options[arg] = f"[{arg}]"
            methods = ','.join(sorted(rule.methods))
            relevant_methods = {m for m in methods.split(',') if m not in ['OPTIONS', 'HEAD']}
            if not relevant_methods:
                continue
            methods_str = ','.join(sorted(list(relevant_methods)))
            url = urllib.parse.unquote(rule.rule)
            line = f"{rule.endpoint:35s} {methods_str:25s} {url}"
            output.append(line)
        print("\n--- Available Application Routes ---")
        for line in sorted(output):
            print(line)
        print("------------------------------------\n")
