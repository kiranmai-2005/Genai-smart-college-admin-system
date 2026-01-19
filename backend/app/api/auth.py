from flask import Blueprint, request, jsonify
from app import db, jwt
from app.models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt # Import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)

    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        # For debugging: print the JWT_SECRET_KEY
        from flask import current_app
        current_app.logger.debug(f"JWT_SECRET_KEY used for token creation: {current_app.config['JWT_SECRET_KEY']}")

        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"message": "Bad username or password"}), 401

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    return jsonify(logged_in_as=current_user_id), 200

# Endpoint to create an admin user (for initial setup, could be restricted in production)
@auth_bp.route('/register_admin', methods=['POST'])
def register_admin():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    email = request.json.get('email', None)

    if not username or not password or not email:
        return jsonify({"message": "Missing username, password, or email"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 409

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    new_user = User(username=username, password_hash=hashed_password, email=email, is_admin=True)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Admin user created successfully", "user_id": new_user.id}), 201
