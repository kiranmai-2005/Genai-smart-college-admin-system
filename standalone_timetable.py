#!/usr/bin/env python3
"""
Standalone timetable generation - no external dependencies
"""
import random
from collections import defaultdict

def generate_timetable():
    """Generate a complete conflict-free weekly timetable"""

    # Configuration
    config = {
        "branches": ["CSE", "ECE"],
        "sections_per_branch": {"CSE": ["A", "B"], "ECE": ["A"]},
        "slots_per_day": [
            {"start": "09:00", "end": "10:00", "type": "lecture"},
            {"start": "10:00", "end": "11:00", "type": "lecture"},
            {"start": "11:00", "end": "12:00", "type": "lecture"},
            {"start": "12:00", "end": "13:00", "type": "break"},
            {"start": "13:00", "end": "14:00", "type": "lecture"},
            {"start": "14:00", "end": "15:00", "type": "lecture"},
            {"start": "15:00", "end": "16:00", "type": "lecture"}
        ]
    }

    # Faculty data
    faculties = {
        'F001': {
            'name': 'Dr. Anya Sharma',
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
        'F002': {
            'name': 'Prof. Ben Carter',
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
        'F003': {
            'name': 'Dr. Cathy Lee',
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
    }

    # Subject data
    subjects = {
        'CS301': {'name': 'Data Structures', 'is_lab': False, 'periods': 1},
        'CS302': {'name': 'Computer Networks', 'is_lab': False, 'periods': 1},
        'EC301': {'name': 'Digital Logic', 'is_lab': False, 'periods': 1},
        'EC302': {'name': 'Signals & Systems', 'is_lab': False, 'periods': 1},
        'CSL301': {'name': 'DS Lab', 'is_lab': True, 'periods': 2},
        'ECL301': {'name': 'DLD Lab', 'is_lab': True, 'periods': 2}
    }

    # Room data
    rooms = {
        'LH101': {'type': 'lecture', 'is_lab': False},
        'LH102': {'type': 'lecture', 'is_lab': False},
        'CSE_Lab1': {'type': 'lab', 'is_lab': True},
        'ECE_Lab1': {'type': 'lab', 'is_lab': True}
    }

    # Subject allocations
    allocations = [
        # CSE A
        {'subject': 'CS301', 'faculty': 'F001', 'branch': 'CSE', 'section': 'A', 'weekly_hours': 3},
        {'subject': 'CS302', 'faculty': 'F003', 'branch': 'CSE', 'section': 'A', 'weekly_hours': 2},
        {'subject': 'CSL301', 'faculty': 'F001', 'branch': 'CSE', 'section': 'A', 'weekly_hours': 2},

        # CSE B
        {'subject': 'CS301', 'faculty': 'F001', 'branch': 'CSE', 'section': 'B', 'weekly_hours': 3},
        {'subject': 'CS302', 'faculty': 'F003', 'branch': 'CSE', 'section': 'B', 'weekly_hours': 2},
        {'subject': 'CSL301', 'faculty': 'F003', 'branch': 'CSE', 'section': 'B', 'weekly_hours': 2},

        # ECE A
        {'subject': 'EC301', 'faculty': 'F002', 'branch': 'ECE', 'section': 'A', 'weekly_hours': 3},
        {'subject': 'EC302', 'faculty': 'F002', 'branch': 'ECE', 'section': 'A', 'weekly_hours': 2},
        {'subject': 'ECL301', 'faculty': 'F002', 'branch': 'ECE', 'section': 'A', 'weekly_hours': 2}
    ]

    # Initialize timetable structure
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    slots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"]  # Skip lunch break

    timetable = {}
    for day in days:
        timetable[day] = {}
        for slot in slots:
            timetable[day][slot] = {}

    # Track faculty workload
    faculty_workload = defaultdict(lambda: {'weekly': 0, 'daily': defaultdict(int)})
    faculty_assigned = defaultdict(list)
    room_occupied = defaultdict(list)
    section_assigned = defaultdict(lambda: defaultdict(int))

    # Sort allocations: labs first, then by weekly hours
    allocations.sort(key=lambda x: (not subjects[x['subject']]['is_lab'], -x['weekly_hours']))

    success_count = 0
    conflict_count = 0

    for alloc in allocations:
        subject_code = alloc['subject']
        faculty_id = alloc['faculty']
        branch = alloc['branch']
        section = alloc['section']
        required_hours = alloc['weekly_hours']

        subject = subjects[subject_code]
        faculty = faculties[faculty_id]

        target_section = f"{branch}-{section}"
        periods_needed = required_hours // subject['periods']
        consecutive_periods = subject['periods']

        assigned_periods = 0

        # Try to assign the required periods
        for _ in range(periods_needed):
            assigned = False
            attempts = 0
            max_attempts = 100

            while not assigned and attempts < max_attempts:
                attempts += 1

                # Choose random day and slot
                day = random.choice(days)
                available_slots = [s for s in slots if s not in ['12:00']]  # Avoid lunch
                slot = random.choice(available_slots)

                # Check faculty availability
                faculty_available = faculty['availability'].get(day, [])
                slot_range = f"{slot}-{slots[slots.index(slot) + consecutive_periods - 1] if slots.index(slot) + consecutive_periods <= len(slots) else slots[-1]}:00"

                if not any(slot_range.split('-')[0] in avail for avail in faculty_available):
                    continue

                # Check consecutive slots availability for labs
                consecutive_slots = []
                start_idx = slots.index(slot)
                if start_idx + consecutive_periods > len(slots):
                    continue

                for i in range(consecutive_periods):
                    consecutive_slots.append(slots[start_idx + i])

                # Check if all consecutive slots are free for this section
                section_free = True
                for consec_slot in consecutive_slots:
                    if timetable[day][consec_slot].get(target_section):
                        section_free = False
                        break

                if not section_free:
                    continue

                # Check faculty not teaching elsewhere
                faculty_free = True
                for consec_slot in consecutive_slots:
                    for other_section, class_info in timetable[day][consec_slot].items():
                        if class_info and class_info.get('faculty') == faculty_id:
                            faculty_free = False
                            break
                    if not faculty_free:
                        break

                if not faculty_free:
                    continue

                # Check faculty workload
                current_daily = faculty_workload[faculty_id]['daily'][day]
                current_weekly = faculty_workload[faculty_id]['weekly']

                if (current_daily + consecutive_periods > faculty['max_daily_periods'] or
                    current_weekly + consecutive_periods > faculty['max_weekly_workload']):
                    continue

                # Find suitable room
                suitable_room = None
                for room_name, room_info in rooms.items():
                    if room_info['is_lab'] == subject['is_lab']:
                        room_free = True
                        for consec_slot in consecutive_slots:
                            if (day, consec_slot) in room_occupied[room_name]:
                                room_free = False
                                break
                        if room_free:
                            suitable_room = room_name
                            break

                if not suitable_room:
                    continue

                # Assign the slot
                for i, consec_slot in enumerate(consecutive_slots):
                    timetable[day][consec_slot][target_section] = {
                        'subject': subject_code,
                        'faculty': faculty_id,
                        'room': suitable_room,
                        'consecutive_part': f"{i+1}/{consecutive_periods}" if consecutive_periods > 1 else None
                    }

                    faculty_workload[faculty_id]['daily'][day] += 1
                    faculty_workload[faculty_id]['weekly'] += 1
                    room_occupied[suitable_room].append((day, consec_slot))
                    faculty_assigned[faculty_id].append((day, consec_slot, target_section))

                section_assigned[target_section][subject_code] += consecutive_periods
                assigned_periods += consecutive_periods
                assigned = True
                success_count += 1

            if not assigned:
                conflict_count += 1
                print(f"Could not assign {subject_code} for {target_section}")

    return timetable, faculties, success_count, conflict_count

# Generate and display timetable
timetable, faculties, success_count, conflict_count = generate_timetable()

print("="*80)
print("COLLEGE TIMETABLE - CONFLICT-FREE SCHEDULE")
print("="*80)

days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
slots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"]

for day in days:
    print(f"\n{day}:")
    print("-" * 60)
    for slot in slots:
        if slot in timetable[day]:
            slot_data = timetable[day][slot]
            if slot_data:
                classes = []
                for section, info in slot_data.items():
                    if info:
                        subject = info['subject']
                        faculty = info['faculty']
                        room = info['room']
                        classes.append(f"{section}: {subject} ({faculty}, {room})")
                if classes:
                    print(f"  {slot}: {classes[0]}")
                    for cls in classes[1:]:
                        print(f"           {cls}")
                else:
                    print(f"  {slot}: Free")
            else:
                print(f"  {slot}: Free")
        else:
            print(f"  {slot}: Break")

print("\n" + "="*80)
print("FACULTY SCHEDULES")
print("="*80)

# Faculty schedules
faculty_schedule = defaultdict(lambda: defaultdict(list))
for day in days:
    for slot in slots:
        if slot in timetable[day]:
            for section, info in timetable[day][slot].items():
                if info:
                    faculty_id = info['faculty']
                    faculty_schedule[faculty_id][day].append(f"{slot}: {section}-{info['subject']} ({info['room']})")

for faculty_id, schedule in faculty_schedule.items():
    faculty_name = faculties[faculty_id]['name']
    print(f"\n{faculty_name} ({faculty_id}):")
    for day in days:
        if day in schedule:
            print(f"  {day}: {', '.join(schedule[day])}")
        else:
            print(f"  {day}: Free all day")

print(f"\nSUMMARY: {success_count} successful assignments, {conflict_count} conflicts")
print("Timetable generation completed!")
