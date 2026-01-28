from app import create_app

app = create_app()

if __name__ == '__main__':
    # For network access, use host='0.0.0.0'
    # For local development, use host='127.0.0.1'
    print("[*] College Admin API starting...")
    print("[*] Backend API: http://localhost:5000")
    print("[*] Network access available on port 5000")
    app.run(debug=False, host='0.0.0.0', port=5000)
