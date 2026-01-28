#!/usr/bin/env python
"""Fix authentication by ensuring admin user exists with correct password"""
import os
import sys

os.environ['FLASK_APP'] = 'wsgi.py'

try:
    from app import create_app, db
    from app.models import User, set_password
    
    app = create_app()
    
    with app.app_context():
        # Delete existing admin user if it exists
        existing_admin = User.query.filter_by(username='admin').first()
        if existing_admin:
            print(f"Deleting existing admin user (ID: {existing_admin.id})")
            db.session.delete(existing_admin)
            db.session.commit()
        
        # Create new admin user with correct password
        print("Creating new admin user with password 'admin_password'")
        admin_user = User(
            username='admin',
            email='admin@college.edu',
            is_admin=True
        )
        admin_user.set_password('admin_password')
        db.session.add(admin_user)
        db.session.commit()
        
        print(f"✓ Admin user created successfully (ID: {admin_user.id})")
        print(f"  Username: {admin_user.username}")
        print(f"  Email: {admin_user.email}")
        print(f"  Is Admin: {admin_user.is_admin}")
        
        # Verify login works
        from app.models import check_password
        test_user = User.query.filter_by(username='admin').first()
        if test_user and check_password(test_user.password_hash, 'admin_password'):
            print("\n✓ Password verification successful!")
        else:
            print("\n✗ Password verification failed!")
            
except ImportError as e:
    print(f"Import error (OpenAI library issue): {e}")
    print("\nTrying alternative approach...")
    
    # Simpler approach without importing app
    import sqlite3
    import bcrypt
    
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'college_admin.db')
    
    # Try alternate location
    if not os.path.exists(db_path):
        db_path = os.path.join(os.path.dirname(__file__), 'college_admin.db')
    
    if os.path.exists(db_path):
        print(f"Found database at: {db_path}")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Delete existing admin
        cursor.execute("DELETE FROM users WHERE username = 'admin'")
        
        # Create new admin with hashed password
        password = 'admin_password'
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, ?)",
            ('admin', 'admin@college.edu', hashed, 1)
        )
        conn.commit()
        conn.close()
        
        print("✓ Admin user recreated in database")
    else:
        print(f"Database not found at expected locations")
        sys.exit(1)

print("\nYou can now log in with:")
print("  Username: admin")
print("  Password: admin_password")
