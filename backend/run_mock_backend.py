#!/usr/bin/env python
"""Run mock backend with Waitress server (Windows-friendly)"""
from waitress import serve
from mock_backend import app

if __name__ == '__main__':
    print("[*] Starting Mock Backend with Waitress on 0.0.0.0:5000")
    serve(app, host='0.0.0.0', port=5000, threads=4)
