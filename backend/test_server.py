#!/usr/bin/env python
"""Simple test server to debug login issues"""
import os
import sys
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

os.environ['FLASK_APP'] = 'wsgi.py'

try:
    logger.info("Creating Flask app...")
    from app import create_app
    from flask import request
    app = create_app()
    logger.info("Flask app created successfully")
    
    # Add request logging
    @app.before_request
    def log_request():
        logger.info(f"Incoming: {request.method} {request.path}")
    
    @app.after_request
    def log_response(response):
        logger.info(f"Response: {response.status_code}")
        return response
    
    @app.errorhandler(Exception)
    def handle_error(error):
        logger.error(f"Error: {error}", exc_info=True)
        return {"error": str(error)}, 500
    
    logger.info("Running server on 0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
    
except Exception as e:
    logger.error(f"Fatal error: {e}", exc_info=True)
    sys.exit(1)
