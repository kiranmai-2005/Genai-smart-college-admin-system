#!/usr/bin/env python3
"""
Quick timetable generation script
"""
import sys
import os
sys.path.append('backend')

from datetime import datetime
from backend.app.services.timetable_solver import generate_timetable_draft_with_xai

# Mock configuration data
config_data = {
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

# Mock faculty data
faculties_data = [
    {
        'employee_id': 'F001',
        'name': 'Dr. Anya Sharma',
        'department': 'CSE',
        'max_weekly_workload': 20,
        'max_daily_periods': 4,
        'availability': {
            'Monday': ['09:00-10:00', '10:00-11:00'],
            'Tuesday': ['13:00-14:00', '14:00-15:00'],
            'Wednesday': [],
            'Thursday': ['09:00-10:00', '10:00-11:00', '15:00-16:00'],
            'Friday': ['09:00-10:00', '10:00-11:00']
        }
    },
    {
        'employee_id': 'F002',
        'name': 'Prof. Ben Carter',
        'department': 'ECE',
        'max_weekly_workload': 18,
        'max_daily_periods': 3,
        'availability': {
            'Monday': ['13:00-14:00', '14:00-15:00'],
            'Tuesday': ['09:00-10:00'],
            'Wednesday': ['10:00-11:00', '11:00-12:00'],
            'Thursday': [],
            'Friday': ['13:00-14:00', '14:00-15:00']
        }
    },
    {
        'employee_id': 'F003',
        'name': 'Dr. Cathy Lee',
        'department': 'CSE',
        'max_weekly_workload': 22,
        'max_daily_periods': 5,
        'availability': {
            'Monday': ['09:00-10:00', '10:00-11:00', '11:00-12:00'],
            'Tuesday': ['09:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00'],
            'Wednesday': ['09:00-10:00'],
            'Thursday': ['13:00-14:00', '14:00-15:00'],
            'Friday': ['09:00-10:00', '10:00-11:00']
        }
    }
]

# Mock subject data
subjects_data = [
    {'code': 'CS301', 'name': 'Data Structures and Algorithms', 'is_lab': False, 'required_frequency_per_week': 3, 'lecture_periods': 1, 'lab_periods': None},
    {'code': 'CS302', 'name': 'Computer Networks', 'is_lab': False, 'required_frequency_per_week': 2, 'lecture_periods': 1, 'lab_periods': None},
    {'code': 'EC301', 'name': 'Digital Logic Design', 'is_lab': False, 'required_frequency_per_week': 3, 'lecture_periods': 1, 'lab_periods': None},
    {'code': 'EC302', 'name': 'Signals and Systems', 'is_lab': False, 'required_frequency_per_week': 2, 'lecture_periods': 1, 'lab_periods': None},
    {'code': 'CSL301', 'name': 'Data Structures Lab', 'is_lab': True, 'required_frequency_per_week': 1, 'lecture_periods': None, 'lab_periods': 2},
    {'code': 'ECL301', 'name': 'Digital Logic Design Lab', 'is_lab': True, 'required_frequency_per_week': 1, 'lecture_periods': None, 'lab_periods': 2}
]

# Mock room data
rooms_data = [
    {'id': 1, 'name': 'LH101', 'is_lab': False},
    {'id': 2, 'name': 'LH102', 'is_lab': False},
    {'id': 3, 'name': 'CSE_Lab1', 'is_lab': True},
    {'id': 4, 'name': 'ECE_Lab1', 'is_lab': True}
]

# Mock config object
class MockConfig:
    def __init__(self, config_data):
        self.branches = config_data["branches"]
        self.sections_per_branch = config_data["sections_per_branch"]
        self.slots_per_day = config_data["slots_per_day"]

# Mock faculty objects
class MockFaculty:
    def __init__(self, data):
        self.employee_id = data['employee_id']
        self.name = data['name']
        self.max_weekly_workload = data['max_weekly_workload']
        self.max_daily_periods = data['max_daily_periods']
        self.availability = data['availability']

# Mock subject objects
class MockSubject:
    def __init__(self, data):
        self.code = data['code']
        self.name = data['name']
        self.is_lab = data['is_lab']
        self.required_frequency_per_week = data['required_frequency_per_week']
        self.lecture_periods = data['lecture_periods']
        self.lab_periods = data['lab_periods']

# Mock room objects
class MockRoom:
    def __init__(self, data):
        self.id = data['id']
        self.name = data['name']
        self.is_lab = data['is_lab']

# Create mock objects
config = MockConfig(config_data)
faculties = [MockFaculty(f) for f in faculties_data]
subjects = [MockSubject(s) for s in subjects_data]
rooms = [MockRoom(r) for r in rooms_data]

# Sample subject allocations (this would normally come from user input)
inputs = {
    'subject_allocations': [
        # CSE Branch allocations
        {'subject_code': 'CS301', 'faculty': 'F001', 'branch': 'CSE', 'section': 'A', 'periods_per_week': 3},
        {'subject_code': 'CS301', 'faculty': 'F001', 'branch': 'CSE', 'section': 'B', 'periods_per_week': 3},
        {'subject_code': 'CS302', 'faculty': 'F003', 'branch': 'CSE', 'section': 'A', 'periods_per_week': 2},
        {'subject_code': 'CS302', 'faculty': 'F003', 'branch': 'CSE', 'section': 'B', 'periods_per_week': 2},
        {'subject_code': 'CSL301', 'faculty': 'F001', 'branch': 'CSE', 'section': 'A', 'periods_per_week': 2},
        {'subject_code': 'CSL301', 'faculty': 'F003', 'branch': 'CSE', 'section': 'B', 'periods_per_week': 2},

        # ECE Branch allocations
        {'subject_code': 'EC301', 'faculty': 'F002', 'branch': 'ECE', 'section': 'A', 'periods_per_week': 3},
        {'subject_code': 'EC302', 'faculty': 'F002', 'branch': 'ECE', 'section': 'A', 'periods_per_week': 2},
        {'subject_code': 'ECL301', 'faculty': 'F002', 'branch': 'ECE', 'section': 'A', 'periods_per_week': 2}
    ]
}

# Generate timetable
print("Generating timetable...")
draft_timetable, xai_logs = generate_timetable_draft_with_xai(
    config=config,
    inputs=inputs,
    all_faculties=faculties,
    all_subjects=subjects,
    all_rooms=rooms
)

print("Timetable generated successfully!")
print("\n" + "="*80)
print("TIMETABLE SCHEDULE")
print("="*80)

# Display timetable in readable format
days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"]

for day in days:
    print(f"\n{day}:")
    print("-" * 50)
    for slot in slots:
        if slot in draft_timetable.get(day, {}):
            slot_data = draft_timetable[day][slot]
            if slot_data:
                classes = []
                for branch_section, class_info in slot_data.items():
                    if class_info:
                        subject = class_info.get('subject', 'Free')
                        faculty = class_info.get('faculty', '')
                        room = class_info.get('room', '')
                        classes.append(f"{branch_section}: {subject} ({faculty}, {room})")
                if classes:
                    print(f"  {slot}: {', '.join(classes)}")
                else:
                    print(f"  {slot}: Free")
            else:
                print(f"  {slot}: Free")
        else:
            print(f"  {slot}: Break/Lunch")

print("\n" + "="*80)
print("FACULTY SCHEDULES")
print("="*80)

# Display faculty-wise schedules
faculty_schedule = {}
for day in days:
    for slot in slots:
        if slot in draft_timetable.get(day, {}):
            slot_data = draft_timetable[day][slot]
            if slot_data:
                for branch_section, class_info in slot_data.items():
                    if class_info:
                        faculty_id = class_info.get('faculty')
                        subject = class_info.get('subject')
                        room = class_info.get('room')
                        if faculty_id not in faculty_schedule:
                            faculty_schedule[faculty_id] = {}
                        if day not in faculty_schedule[faculty_id]:
                            faculty_schedule[faculty_id][day] = {}
                        faculty_schedule[faculty_id][day][slot] = f"{branch_section}-{subject} ({room})"

for faculty_id, schedule in faculty_schedule.items():
    faculty_name = next((f.name for f in faculties if f.employee_id == faculty_id), faculty_id)
    print(f"\n{faculty_name} ({faculty_id}):")
    for day in days:
        if day in schedule:
            day_slots = []
            for slot in slots:
                if slot in schedule[day]:
                    day_slots.append(f"{slot}: {schedule[day][slot]}")
                else:
                    day_slots.append(f"{slot}: Free")
            print(f"  {day}: {', '.join(day_slots)}")
        else:
            print(f"  {day}: Free all day")

print("\n" + "="*80)
print("XAI LOGS SUMMARY")
print("="*80)

# Display XAI logs summary
success_count = sum(1 for log in xai_logs if log['log_type'] == 'choice')
conflict_count = sum(1 for log in xai_logs if log['log_type'] == 'conflict')
rejection_count = sum(1 for log in xai_logs if log['log_type'] == 'rejection')

print(f"Total operations: {len(xai_logs)}")
print(f"Successful assignments: {success_count}")
print(f"Conflicts detected: {conflict_count}")
print(f"Rejections: {rejection_count}")

if conflict_count > 0 or rejection_count > 0:
    print("\nKey issues:")
    for log in xai_logs:
        if log['log_type'] in ['conflict', 'rejection'] and log['priority'] >= 3:
            print(f"- {log['rule_name']}: {log['explanation'][:100]}...")
