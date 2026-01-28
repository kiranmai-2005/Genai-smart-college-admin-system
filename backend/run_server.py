#!/usr/bin/env python
"""Run Flask app with better error handling"""
import sys
import traceback

try:
    print("[*] Importing Flask...")
    from flask import Flask
    print("[*] Flask imported successfully")
    
    print("[*] Creating app...")
    from app import create_app
    app = create_app()
    print("[*] App created successfully")
    
    print("[*] Starting server on 0.0.0.0:5000...")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    
except KeyboardInterrupt:
    print("\n[*] Server stopped")
    sys.exit(0)
except Exception as e:
    print(f"[!] Error: {e}")
    print("[!] Traceback:")
    traceback.print_exc()
    sys.exit(1)
