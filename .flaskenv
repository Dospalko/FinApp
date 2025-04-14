# .flaskenv
FLASK_APP=backend.app:create_app
FLASK_ENV=development
FLASK_RUN_PORT=5000
FLASK_RUN_HOST=127.0.0.1
# Explicitne definuj povolený origin pre CORS
CORS_ORIGINS=http://localhost:5173
# Ostatné premenné (príklady)
SECRET_KEY=vygeneruj-si-nahodny-retazec-pre-vyvoj
JWT_SECRET_KEY=vygeneruj-si-aj-tento-nahodny-retazec
# Cesta k DB relatívne k 'backend' adresáru, kde je __init__.py
# alebo absolútna cesta, ak je to potrebné
SQLALCHEMY_DATABASE_URI=sqlite:///../instance/tracker.db