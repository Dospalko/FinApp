# backend/run.py
from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_RUN_PORT', 5000))
    host = os.environ.get('FLASK_RUN_HOST', '127.0.0.1')
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    # Add this line to ensure routes are registered
    with app.app_context():
        print(f"Registered routes:")
        for rule in app.url_map.iter_rules():
            print(f"{rule.endpoint}: {rule.rule}")
    
    print(f"Starting Flask server on http://{host}:{port}/ (Debug: {debug_mode})")
    app.run(host=host, port=port, debug=debug_mode)
