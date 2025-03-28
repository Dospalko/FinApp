import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config # Import z hlavného priečinka

db = SQLAlchemy()

def create_app(config_class=Config):
    """Vytvorí a nakonfiguruje Flask aplikáciu."""
    app = Flask(__name__, instance_path=Config.SQLALCHEMY_DATABASE_URI.split('///')[1].replace('tracker.db',''))
    app.config.from_object(config_class)

    print(f"Backend instance path: {app.instance_path}")
    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

    # Povoliť CORS pre frontend (bežiaci na porte 5173 - default pre Vite)
    # V produkcii nastav špecifickejšie!
    CORS(app, origins="http://localhost:5173")
    db.init_app(app)

    with app.app_context():
        # Import modelov, aby ich SQLAlchemy zaregistrovalo
        from . import models # Import z aktuálneho balíka 'backend'

        # Registrácia Blueprintu pre API routy
        from . import routes
        app.register_blueprint(routes.bp, url_prefix='/api') # Všetky API routy začnú /api

        # Príkaz na inicializáciu DB cez 'flask init-db'
        @app.cli.command('init-db')
        def init_db_command():
            """Vymaže existujúce dáta (ak existujú) a vytvorí nové tabuľky."""
            print("Inicializujem databázu...")
            # db.drop_all() # Opatrne s týmto v budúcnosti!
            db.create_all()
            print("Databáza inicializovaná (tabuľky vytvorené).")

        @app.route('/api/ping') # Jednoduchý testovací endpoint
        def ping():
            return {"message": "Backend je online!"}

    return app