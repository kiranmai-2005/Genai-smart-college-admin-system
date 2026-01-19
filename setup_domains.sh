#!/bin/bash

echo "==============================================="
echo "  COLLEGE ADMIN PRO - DOMAIN SETUP (Linux/Mac)"
echo "==============================================="
echo
echo "This script will help you set up professional domain names"
echo "for your College Admin Pro system."
echo
echo "The system will be accessible at:"
echo "- http://college-admin.edu (Frontend)"
echo "- http://api.college-admin.edu (Backend API)"
echo
echo "==============================================="

# Check if running as root/sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run this script with sudo privileges:"
    echo "sudo ./setup_domains.sh"
    exit 1
fi

echo "Adding domain entries to hosts file..."
echo

# Backup hosts file
cp /etc/hosts /etc/hosts.backup 2>/dev/null

# Add localhost entries
echo "127.0.0.1    college-admin.edu" >> /etc/hosts
echo "127.0.0.1    api.college-admin.edu" >> /etc/hosts

echo
echo "==============================================="
echo "SUCCESS! Domain names have been configured."
echo "==============================================="
echo
echo "Your system is now accessible at:"
echo "- Frontend: http://college-admin.edu"
echo "- Backend:  http://api.college-admin.edu"
echo
echo "To start the system:"
echo "1. Run './open_demo.sh' to start everything (if available)"
echo "2. Or start manually:"
echo "   cd backend && python wsgi.py"
echo "   cd frontend && npm start"
echo
echo "Press Enter to continue..."
read
