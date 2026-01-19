from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from datetime import timedelta

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}) # Allow CORS for frontend

    # Import models so Flask-Migrate can detect them
    from app import models

    with app.app_context():
        db.create_all()

    # Register Blueprints
    from app.api.auth import auth_bp
    from app.api.documents import documents_bp
    from app.api.pdf_parser import pdf_parser_bp
    from app.api.rag import rag_bp
    from app.api.timetable import timetable_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(documents_bp, url_prefix='/api')
    app.register_blueprint(pdf_parser_bp, url_prefix='/api')
    app.register_blueprint(rag_bp, url_prefix='/api')
    app.register_blueprint(timetable_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return "Gen-AI Smart College Admin Assistant Backend"

    return app
