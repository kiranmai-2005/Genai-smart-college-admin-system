#!/usr/bin/env python
"""Run the Flask app using waitress (Windows-friendly WSGI server)"""
import sys
import os

try:
    print("[*] Importing waitress...")
    from waitress import serve
    
    print("[*] Creating Flask app...")
    from app import create_app
    
    app = create_app()
    print("[*] Flask app created successfully")
    
    print("[*] Starting server with waitress...")
    print("[*] Backend API: http://localhost:5000")
    print("[*] Listening on http://0.0.0.0:5000")
    print("[*] Press Ctrl+C to stop")
    
    # Use waitress to serve the app - this is more compatible with Windows
    serve(app, host='0.0.0.0', port=5000, threads=10)
    
except KeyboardInterrupt:
    print("\n[*] Server stopped by user")
    sys.exit(0)
except Exception as e:
    print(f"[!] Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
