#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 8080
DIRECTORY = "frontend/build"

class ProductionHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Handle SPA routing - serve index.html for all routes
        if path == '/' or (not path.endswith('.js') and not path.endswith('.css') and not path.endswith('.json') and not path.endswith('.map')):
            path = '/index.html'
        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def main():
    build_path = Path(DIRECTORY)
    if not build_path.exists():
        print("❌ Error: Production build not found!")
        print("Run 'deploy_production.bat' first to build the application.")
        sys.exit(1)

    os.chdir(DIRECTORY)

    try:
        with socketserver.TCPServer(("", PORT), ProductionHandler) as httpd:
            print("🚀 College Admin Pro - Production Server")
            print("=" * 50)
            print(f"🌐 Access at: http://localhost:{PORT}")
            print(f"🌐 Network: http://192.168.29.105:{PORT}")
            print()
            print("Press Ctrl+C to stop")
            print("=" * 50)
            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
