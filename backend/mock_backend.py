#!/usr/bin/env python
"""Minimal backend mock server for testing frontend authentication"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
import sqlite3
import bcrypt
from datetime import timedelta

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = 'a_very_secret_key_that_should_be_changed_in_production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

jwt = JWTManager(app)

def get_user_from_db(username):
    """Get user from database"""
    try:
        conn = sqlite3.connect('instance/college_admin.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, email, password_hash FROM users WHERE username = ?', (username,))
        result = cursor.fetchone()
        conn.close()
        return result
    except Exception as e:
        print(f"Database error: {e}")
        return None

@app.route('/')
def index():
    return "Gen-AI Smart College Admin Assistant Backend (Mock)"

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"message": "Missing username or password"}), 400
        
        user_data = get_user_from_db(username)
        
        if not user_data:
            return jsonify({"message": "Bad username or password"}), 401
        
        user_id, db_username, email, password_hash = user_data
        
        # Verify password
        try:
            is_valid = bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception as e:
            print(f"Password check error: {e}")
            return jsonify({"message": "Bad username or password"}), 401
        
        if not is_valid:
            return jsonify({"message": "Bad username or password"}), 401
        
        # Create JWT token
        access_token = create_access_token(identity=str(user_id))
        return jsonify(access_token=access_token), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Error: {str(e)}"}), 500

@app.route('/api/timetable/configs', methods=['GET'])
def get_configs():
    """Return mock timetable configurations"""
    return jsonify([{
        "id": 1,
        "config_name": "Fall 2025 Semester Config",
        "academic_year": "2025-2026",
        "semester": "Fall",
        "branches": ["CSE", "ECE"],
        "sections_per_branch": {"CSE": ["A", "B"], "ECE": ["A"]},
        "slots_per_day": [
            {"start": "09:00", "end": "10:00", "type": "lecture"},
            {"start": "10:00", "end": "11:00", "type": "lecture"},
            {"start": "11:00", "end": "12:00", "type": "lecture"},
            {"start": "12:00", "end": "13:00", "type": "break"},
            {"start": "13:00", "end": "14:00", "type": "lecture"},
            {"start": "14:00", "end": "15:00", "type": "lecture"},
            {"start": "15:00", "end": "16:00", "type": "lab_lecture_combined"}
        ],
        "created_at": "2025-01-28T00:00:00"
    }]), 200

if __name__ == '__main__':
    print("[*] Mock Backend starting on 0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
