#!/usr/bin/env python3
"""
Create an offline demo of the College Admin Pro system
This version works without backend - perfect for sharing!
"""
import os
import shutil
from pathlib import Path

def create_offline_demo():
    """Create a standalone offline demo"""

    # Source and destination paths
    build_dir = Path("frontend/build")
    offline_dir = Path("college-admin-demo")

    if not build_dir.exists():
        print("ERROR: Frontend build not found! Run: cd frontend && npm run build")
        return False

    # Remove old demo if exists
    if offline_dir.exists():
        shutil.rmtree(offline_dir)

    # Copy the build to demo directory
    shutil.copytree(build_dir, offline_dir)

    # Create offline index.html that uses demo data
    offline_html = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="College Admin Pro - Complete Timetable Management System" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>College Admin Pro - Demo</title>
    <style>
      body {{
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }}

      .loading {{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 24px;
        flex-direction: column;
      }}

      .spinner {{
        border: 4px solid rgba(255,255,255,0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }}

      @keyframes spin {{
        0% {{ transform: rotate(0deg); }}
        100% {{ transform: rotate(360deg); }}
      }}
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">
      <div class="loading">
        <div class="spinner"></div>
        <div>College Admin Pro</div>
        <div style="font-size: 16px; margin-top: 10px;">Loading Demo...</div>
      </div>
    </div>

    <!-- Load the built React app -->
    <script>
      // Set demo mode - no backend required
      window.REACT_APP_DEMO_MODE = 'true';
      window.REACT_APP_BACKEND_URL = '';
    </script>

    <!-- Load React app -->
    <script src="./static/js/main.a8bef91c.js"></script>
  </body>
</html>"""

    # Write the offline HTML
    with open(offline_dir / "index.html", "w", encoding="utf-8") as f:
        f.write(offline_html)

    print("SUCCESS: Offline demo created successfully!")
    print(f"Location: {offline_dir.absolute()}")
    print()
    print("To share the demo:")
    print("1. Open index.html in any web browser")
    print("2. Or run: python -m http.server 8000 (then visit http://localhost:8000)")
    print("3. Full system works offline with demo data!")
    print()
    print("Features available offline:")
    print("* Admin Panel (configure demo data)")
    print("* Real-time Timetable Generation")
    print("* Interactive UI with animations")
    print("* No backend required!")

    return True

if __name__ == "__main__":
    create_offline_demo()
