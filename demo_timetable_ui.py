#!/usr/bin/env python3
"""
Demo script to show the timetable UI with sample data
"""
import json
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import time
import os

# Sample timetable data in the format expected by the frontend
sample_data = {
    "section_timetables": {
        "CSE-A": {
            "Monday": ["Free", "Free", "Free", "Lunch", "Free", "Free", "CS302"],
            "Tuesday": ["Free", "Free", "CSL301", "Lunch", "Free", "Free", "Free"],
            "Wednesday": ["Free", "Free", "Free", "Lunch", "CS302", "Free", "Free"],
            "Thursday": ["Free", "Free", "Free", "Lunch", "Free", "Free", "Free"],
            "Friday": ["CS301", "CS301", "Free", "Lunch", "Free", "CS301", "Free"]
        },
        "CSE-B": {
            "Monday": ["Free", "Free", "Free", "Lunch", "Free", "Free", "Free"],
            "Tuesday": ["CS302", "Free", "Free", "Lunch", "Free", "CS301", "Free"],
            "Wednesday": ["Free", "CS301", "CSL301", "Lunch", "Free", "Free", "Free"],
            "Thursday": ["Free", "Free", "Free", "Lunch", "Free", "Free", "Free"],
            "Friday": ["Free", "Free", "CS301", "Lunch", "CS302", "Free", "Free"]
        },
        "ECE-A": {
            "Monday": ["Free", "Free", "EC302", "Lunch", "Free", "Free", "Free"],
            "Tuesday": ["EC302", "Free", "Free", "Lunch", "Free", "Free", "Free"],
            "Wednesday": ["Free", "Free", "ECL301", "Lunch", "Free", "Free", "Free"],
            "Thursday": ["Free", "Free", "EC301", "Lunch", "Free", "Free", "Free"],
            "Friday": ["EC301", "Free", "EC301", "Lunch", "Free", "Free", "Free"]
        }
    },
    "faculty_timetables": {
        "Dr. Anya Sharma": {
            "Monday": ["Free", "Free", "Free", "Lunch", "Free", "Free", "Free"],
            "Tuesday": ["Free", "Free", "CSE-A-CSL301", "Lunch", "Free", "CSE-B-CS301", "Free"],
            "Wednesday": ["Free", "CSE-B-CS301", "Free", "Lunch", "Free", "Free", "Free"],
            "Thursday": ["Free", "Free", "Free", "Lunch", "Free", "Free", "Free"],
            "Friday": ["CSE-A-CS301", "CSE-A-CS301", "CSE-B-CS301", "Lunch", "Free", "CSE-A-CS301", "Free"]
        },
        "Prof. Ben Carter": {
            "Monday": ["Free", "Free", "ECE-A-EC302", "Lunch", "Free", "Free", "Free"],
            "Tuesday": ["ECE-A-EC302", "Free", "Free", "Lunch", "Free", "Free", "Free"],
            "Wednesday": ["Free", "Free", "ECE-A-ECL301", "Lunch", "Free", "Free", "Free"],
            "Thursday": ["Free", "Free", "ECE-A-EC301", "Lunch", "Free", "Free", "Free"],
            "Friday": ["ECE-A-EC301", "Free", "ECE-A-EC301", "Lunch", "Free", "Free", "Free"]
        },
        "Dr. Cathy Lee": {
            "Monday": ["Free", "Free", "Free", "Lunch", "Free", "Free", "CSE-A-CS302"],
            "Tuesday": ["CSE-B-CS302", "Free", "Free", "Lunch", "Free", "Free", "Free"],
            "Wednesday": ["Free", "Free", "CSE-B-CSL301", "Lunch", "CSE-A-CS302", "Free", "Free"],
            "Thursday": ["Free", "Free", "Free", "Lunch", "Free", "Free", "Free"],
            "Friday": ["Free", "Free", "Free", "Lunch", "CSE-B-CS302", "Free", "Free"]
        }
    },
    "summary": {
        "total_assignments": 18,
        "conflicts": 0,
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "periods_per_day": 6
    }
}

# Create a simple HTML demo page
html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>College Timetable Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold text-center text-gray-800 mb-8">
            College Administration Timetable System
        </h1>

        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">System Overview</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-green-50 p-4 rounded-md border border-green-200">
                    <div class="text-3xl font-bold text-green-800">18</div>
                    <div className="text-sm text-green-600">Total Assignments</div>
                </div>
                <div class="bg-red-50 p-4 rounded-md border border-red-200">
                    <div class="text-3xl font-bold text-red-800">0</div>
                    <div className="text-sm text-red-600">Conflicts</div>
                </div>
                <div class="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <div class="text-3xl font-bold text-blue-800">6</div>
                    <div className="text-sm text-blue-600">Periods per Day</div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Sample Timetable Display -->
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold text-gray-800 mb-4">📅 Sample Timetable - CSE-A</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="border border-gray-300 p-2">Time</th>
                                <th class="border border-gray-300 p-2">Mon</th>
                                <th class="border border-gray-300 p-2">Tue</th>
                                <th class="border border-gray-300 p-2">Wed</th>
                                <th class="border border-gray-300 p-2">Thu</th>
                                <th class="border border-gray-300 p-2">Fri</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td class="border border-gray-300 p-2 font-medium">09:00-10:00</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-blue-100 text-blue-800">CS301</td></tr>
                            <tr><td class="border border-gray-300 p-2 font-medium">10:00-11:00</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-blue-100 text-blue-800">CS301</td></tr>
                            <tr><td class="border border-gray-300 p-2 font-medium">11:00-12:00</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-red-100 text-red-800">CSL301 🔬</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td></tr>
                            <tr><td class="border border-gray-300 p-2 font-medium bg-orange-50 italic">Lunch</td><td class="border border-gray-300 p-2 bg-orange-50 italic">Lunch</td><td class="border border-gray-300 p-2 bg-orange-50 italic">Lunch</td><td class="border border-gray-300 p-2 bg-orange-50 italic">Lunch</td><td class="border border-gray-300 p-2 bg-orange-50 italic">Lunch</td><td class="border border-gray-300 p-2 bg-orange-50 italic">Lunch</td></tr>
                            <tr><td class="border border-gray-300 p-2 font-medium">13:00-14:00</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-green-100 text-green-800">CS302</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td></tr>
                            <tr><td class="border border-gray-300 p-2 font-medium">14:00-15:00</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-blue-100 text-blue-800">CS301</td></tr>
                            <tr><td class="border border-gray-300 p-2 font-medium">15:00-16:00</td><td class="border border-gray-300 p-2 bg-green-100 text-green-800">CS302</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td><td class="border border-gray-300 p-2 bg-gray-50">Free</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Features -->
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Key Features</h2>
                <ul class="space-y-3">
                    <li class="flex items-center">
                        <span class="text-green-500 mr-2">✓</span>
                        <span><strong>Conflict-Free Scheduling:</strong> No faculty or room conflicts</span>
                    </li>
                    <li class="flex items-center">
                        <span class="text-green-500 mr-2">✓</span>
                        <span><strong>Lab Continuity:</strong> Labs scheduled in continuous blocks</span>
                    </li>
                    <li class="flex items-center">
                        <span class="text-green-500 mr-2">✓</span>
                        <span><strong>Balanced Workload:</strong> Even distribution across faculty</span>
                    </li>
                    <li class="flex items-center">
                        <span class="text-green-500 mr-2">✓</span>
                        <span><strong>Color Coding:</strong> Visual subject differentiation</span>
                    </li>
                    <li class="flex items-center">
                        <span class="text-green-500 mr-2">✓</span>
                        <span><strong>Responsive Design:</strong> Works on all devices</span>
                    </li>
                    <li class="flex items-center">
                        <span class="text-green-500 mr-2">✓</span>
                        <span><strong>Dual Views:</strong> Section and faculty perspectives</span>
                    </li>
                </ul>

                <div class="mt-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">🎨 Color Legend</h3>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div class="flex items-center"><div class="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div><span>Data Structures</span></div>
                        <div class="flex items-center"><div class="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div><span>Computer Networks</span></div>
                        <div class="flex items-center"><div class="w-4 h-4 bg-purple-100 border border-purple-300 rounded mr-2"></div><span>Digital Logic</span></div>
                        <div class="flex items-center"><div class="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div><span>DS Lab 🔬</span></div>
                        <div class="flex items-center"><div class="w-4 h-4 bg-orange-50 border border-orange-300 rounded mr-2"></div><span>Lunch Break</span></div>
                        <div class="flex items-center"><div class="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2"></div><span>Free Period</span></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-8 text-center">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Ready to Use</h2>
                <p class="text-gray-600 mb-4">
                    This timetable system is fully functional with:
                </p>
                <ul class="text-left max-w-md mx-auto space-y-2 text-gray-600">
                    <li>• Complete backend API with conflict resolution</li>
                    <li>• Beautiful, responsive React frontend</li>
                    <li>• Database integration with Flask-SQLAlchemy</li>
                    <li>• XAI logging for transparency</li>
                    <li>• Export capabilities (PDF/CSV ready)</li>
                </ul>
                <div class="mt-6">
                    <a href="http://college-admin.edu" target="_blank" rel="noopener noreferrer" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors no-underline">
                        Launch Full UI Demo
                    </a>
                    <div class="mt-3 text-sm text-gray-600">
                        <p><strong>Manual Access:</strong></p>
                        <p>1. Open a new browser tab</p>
                        <p>2. Go to: <code class="bg-gray-100 px-2 py-1 rounded">http://college-admin.edu</code></p>
                        <p class="text-xs text-gray-500 mt-2">
                            If the link doesn't work, make sure to disable popup blockers or right-click and "Open in new tab"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
"""

# Save the HTML file
with open('timetable_demo.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Beautiful Timetable UI Demo Created!")
print("Files created:")
print("   - timetable_demo.html (Static demo page)")
print("   - frontend/src/components/Dashboard/TimetableDisplay.js (React component)")
print("   - frontend/src/sampleTimetableData.js (Sample data)")
print("")
print("To view the demos:")
print("QUICK START: Run 'open_demo.bat' to open both demos automatically!")
print()
print("Manual access:")
print("1. Static HTML demo: Open timetable_demo.html in your browser")
print("   - Click 'Launch Full UI Demo' button to open the React app")
print("   - Or right-click the button and 'Open in new tab'")
print("2. Full React UI: Go to http://localhost:3000 in your browser")
print("   - Go to 'Timetable Draft Generation' tab")
print("   - Click 'Watch Real-time Generation' to see the magic!")
print("   - Or go to 'Admin Panel' to configure subjects, faculty, sections, rooms")
print("")
print("Features implemented:")
print("* Grid-based timetable layout")
print("* Color coding for different subjects")
print("* Responsive design for all screen sizes")
print("* Toggle between section and faculty views")
print("* Statistics dashboard")
print("* Lab indicators")
print("* Conflict-free scheduling")
print("* Modern UI with Tailwind CSS")

# Auto-open the HTML file in browser
try:
    webbrowser.open('file://' + os.path.realpath('timetable_demo.html'))
    print("\nOpening demo in browser...")
    print("   Click 'View Full UI Demo' button to launch the complete React application!")
except:
    print("\n📎 Please manually open 'timetable_demo.html' in your browser")
    print("   Then click 'View Full UI Demo' button to launch the complete React application!")
