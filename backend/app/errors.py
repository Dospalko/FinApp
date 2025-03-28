# backend/app/errors.py
from flask import jsonify
# from .database import db # Ak by sme robili rollback

def register_error_handlers(app):

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Not Found", "message": "The requested resource was not found."}), 404

    @app.errorhandler(500)
    def internal_error(error):
        # db.session.rollback() # Možný rollback
        print(f"Internal Server Error encountered: {error}") # Logovanie
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

    @app.errorhandler(405)
    def method_not_allowed(error):
         return jsonify({"error": "Method Not Allowed", "message": "The method is not allowed for the requested URL."}), 405

    @app.errorhandler(400)
    def bad_request_error(error):
        message = getattr(error, 'description', "Bad request.")
        return jsonify({"error": "Bad Request", "message": message}), 400