from app import create_app, db
from app.models import User, TimetableConfiguration, Faculty, Subject, Room, set_password
import json
import os

# Ensure FLASK_APP is set for create_app
os.environ['FLASK_APP'] = 'wsgi.py'

app = create_app()
app.app_context().push() # Push application context

# --- Users ---
# Check if admin user already exists before adding
admin_user = User.query.filter_by(username='admin').first()
if not admin_user:
    admin_password_hash = set_password('admin_password')
    admin_user = User(username='admin', password_hash=admin_password_hash, email='admin@college.edu', is_admin=True)
    db.session.add(admin_user)
    db.session.commit() # Commit after adding admin_user to ensure its ID is available for foreign keys
    print("Default user 'admin' added to the database.")
else:
    print("Admin user already exists. Skipping creation.")

# Check if alice user already exists before adding
alice_user = User.query.filter_by(username='alice').first()
if not alice_user:
    alice_password_hash = set_password('admin_password')
    alice_user = User(username='alice', password_hash=alice_password_hash, email='alice@college.edu', is_admin=True)
    db.session.add(alice_user)
    db.session.commit() # Commit after adding alice_user
    print("Default user 'alice' added to the database.")
else:
    print("Alice user already exists. Skipping creation.")

db.session.flush() # Ensure user IDs are available for subsequent operations

# --- Timetable Configuration ---
db.session.flush() # Ensure admin_user.id is available

timetable_config_json = '''
{
    "config_name": "Fall 2025 Semester Config",
    "academic_year": "2025-2026",
    "semester": "Fall",
    "branches": ["CSE", "ECE"],
    "sections_per_branch": {"CSE": ["A", "B"], "ECE": ["A"]},
    "slots_per_day": [
        {"start": "09:00", "end": "10:00", "type": "lecture"},
        {"start": "10:00", "end": "11:00", "type": "lecture"},
        {"start": "11:00", "end": "12:00", "type": "lecture"},
        {"start": "12:00", "end": "13:00", "type": "break"},
        {"start": "13:00", "end": "14:00", "type": "lecture"},
        {"start": "14:00", "end": "15:00", "type": "lecture"},
        {"start": "15:00", "end": "16:00", "type": "lab_lecture_combined"}
    ]
}
'''
timetable_config_data = json.loads(timetable_config_json)

# Check if config already exists before adding
existing_config = TimetableConfiguration.query.filter_by(config_name=timetable_config_data['config_name']).first()
if not existing_config:
    new_config = TimetableConfiguration(
        config_name=timetable_config_data['config_name'],
        academic_year=timetable_config_data['academic_year'],
        semester=timetable_config_data['semester'],
        branches=timetable_config_data['branches'],
        sections_per_branch=timetable_config_data['sections_per_branch'],
        slots_per_day=timetable_config_data['slots_per_day'],
        created_by=admin_user.id
    )
    db.session.add(new_config)
    db.session.commit()
    print(f"Timetable Configuration '{new_config.config_name}' added to the database.")
else:
    print("Timetable Configuration already exists. Skipping creation.")

# --- Faculties ---
faculties_data = [
    {'name': 'Dr. Anya Sharma', 'employee_id': 'F001', 'department': 'CSE', 'max_weekly_workload': 20, 'max_daily_periods': 4, 'availability': {'Monday': ['09:00-10:00', '10:00-11:00'], 'Tuesday': ['13:00-14:00', '14:00-15:00'], 'Wednesday': [], 'Thursday': ['09:00-10:00', '10:00-11:00', '15:00-16:00'], 'Friday': ['09:00-10:00', '10:00-11:00']}},
    {'name': 'Prof. Ben Carter', 'employee_id': 'F002', 'department': 'ECE', 'max_weekly_workload': 18, 'max_daily_periods': 3, 'availability': {'Monday': ['13:00-14:00', '14:00-15:00'], 'Tuesday': ['09:00-10:00'], 'Wednesday': ['10:00-11:00', '11:00-12:00'], 'Thursday': [], 'Friday': ['13:00-14:00', '14:00-15:00']}},
    {'name': 'Dr. Cathy Lee', 'employee_id': 'F003', 'department': 'CSE', 'max_weekly_workload': 22, 'max_daily_periods': 5, 'availability': {'Monday': ['09:00-10:00', '10:00-11:00', '11:00-12:00'], 'Tuesday': ['09:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00'], 'Wednesday': ['09:00-10:00'], 'Thursday': ['13:00-14:00', '14:00-15:00'], 'Friday': ['09:00-10:00', '10:00-11:00']}}
]
added_faculties = 0
for f_data in faculties_data:
    existing_faculty = Faculty.query.filter_by(employee_id=f_data['employee_id']).first()
    if not existing_faculty:
        faculty = Faculty(**f_data)
        db.session.add(faculty)
        added_faculties += 1
if added_faculties > 0:
    db.session.commit()
print(f"Added {added_faculties} faculties to the database.")

# --- Subjects ---
subjects_data = [
    {'name': 'Data Structures and Algorithms', 'code': 'CS301', 'department': 'CSE', 'is_lab': False, 'credits': 4, 'required_frequency_per_week': 3, 'lecture_periods': 1, 'lab_periods': None},
    {'name': 'Computer Networks', 'code': 'CS302', 'department': 'CSE', 'is_lab': False, 'credits': 3, 'required_frequency_per_week': 2, 'lecture_periods': 1, 'lab_periods': None},
    {'name': 'Digital Logic Design', 'code': 'EC301', 'department': 'ECE', 'is_lab': False, 'credits': 4, 'required_frequency_per_week': 3, 'lecture_periods': 1, 'lab_periods': None},
    {'name': 'Signals and Systems', 'code': 'EC302', 'department': 'ECE', 'is_lab': False, 'credits': 3, 'required_frequency_per_week': 2, 'lecture_periods': 1, 'lab_periods': None},
    {'name': 'Data Structures Lab', 'code': 'CSL301', 'department': 'CSE', 'is_lab': True, 'credits': 2, 'required_frequency_per_week': 1, 'lecture_periods': None, 'lab_periods': 2},
    {'name': 'Digital Logic Design Lab', 'code': 'ECL301', 'department': 'ECE', 'is_lab': True, 'credits': 2, 'required_frequency_per_week': 1, 'lecture_periods': None, 'lab_periods': 2}
]
added_subjects = 0
for s_data in subjects_data:
    existing_subject = Subject.query.filter_by(code=s_data['code']).first()
    if not existing_subject:
        subject = Subject(**s_data)
        db.session.add(subject)
        added_subjects += 1
if added_subjects > 0:
    db.session.commit()
print(f"Added {added_subjects} subjects to the database.")

# --- Rooms ---
rooms_data = [
    {'name': 'LH101', 'room_type': 'Lecture Hall', 'capacity': 60, 'is_lab': False},
    {'name': 'LH102', 'room_type': 'Lecture Hall', 'capacity': 60, 'is_lab': False},
    {'name': 'CSE_Lab1', 'room_type': 'Lab', 'capacity': 30, 'is_lab': True},
    {'name': 'ECE_Lab1', 'room_type': 'Lab', 'capacity': 30, 'is_lab': True}
]
added_rooms = 0
for r_data in rooms_data:
    existing_room = Room.query.filter_by(name=r_data['name']).first()
    if not existing_room:
        room = Room(**r_data)
        db.session.add(room)
        added_rooms += 1
if added_rooms > 0:
    db.session.commit()
print(f"Added {added_rooms} rooms to the database.")
