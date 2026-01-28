#!/usr/bin/env python
"""Test admin credentials in database"""
import sqlite3
import bcrypt

db_path = 'instance/college_admin.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute('SELECT id, username, email, password_hash FROM users WHERE username = ?', ('admin',))
result = cursor.fetchone()

if result:
    user_id, username, email, password_hash = result
    print(f'User found:')
    print(f'  ID: {user_id}')
    print(f'  Username: {username}')
    print(f'  Email: {email}')
    print(f'  Password hash (first 50 chars): {password_hash[:50]}...')
    
    # Test password verification
    test_password = 'admin_password'
    try:
        is_valid = bcrypt.checkpw(test_password.encode('utf-8'), password_hash.encode('utf-8'))
        print(f'  Password verification: {"✓ VALID" if is_valid else "✗ INVALID"}')
    except Exception as e:
        print(f'  Password verification error: {e}')
else:
    print('Admin user not found')

conn.close()
