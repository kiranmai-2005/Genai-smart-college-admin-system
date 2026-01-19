#!/usr/bin/env python3
"""
Generate timetable in the exact JSON format requested
"""
import json
import random
from collections import defaultdict

def generate_timetable_json():
    """Generate timetable in the specified JSON format"""

    # Generate the timetable data (same logic as before)
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

    faculties = {
        'F001': {'name': 'Dr. Anya Sharma'},
        'F002': {'name': 'Prof. Ben Carter'},
        'F003': {'name': 'Dr. Cathy Lee'}
    }

    subjects = {
        'CS301': 'Data Structures',
        'CS302': 'Computer Networks',
        'EC301': 'Digital Logic',
        'EC302': 'Signals & Systems',
        'CSL301': 'DS Lab',
        'ECL301': 'DLD Lab'
    }

    rooms = ['LH101', 'LH102', 'CSE_Lab1', 'ECE_Lab1']

    allocations = [
        {'subject': 'CS301', 'faculty': 'F001', 'branch': 'CSE', 'section': 'A', 'weekly_hours': 3},
        {'subject': 'CS302', 'faculty': 'F003', 'branch': 'CSE', 'section': 'A', 'weekly_hours': 2},
        {'subject': 'CSL301', 'faculty': 'F001', 'branch': 'CSE', 'section': 'A', 'weekly_hours': 2},
        {'subject': 'CS301', 'faculty': 'F001', 'branch': 'CSE', 'section': 'B', 'weekly_hours': 3},
        {'subject': 'CS302', 'faculty': 'F003', 'branch': 'CSE', 'section': 'B', 'weekly_hours': 2},
        {'subject': 'CSL301', 'faculty': 'F003', 'branch': 'CSE', 'section': 'B', 'weekly_hours': 2},
        {'subject': 'EC301', 'faculty': 'F002', 'branch': 'ECE', 'section': 'A', 'weekly_hours': 3},
        {'subject': 'EC302', 'faculty': 'F002', 'branch': 'ECE', 'section': 'A', 'weekly_hours': 2},
        {'subject': 'ECL301', 'faculty': 'F002', 'branch': 'ECE', 'section': 'A', 'weekly_hours': 2}
    ]

    # Initialize structures
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"]

    timetable = {}
    for day in days:
        timetable[day] = {}
        for slot in slots:
            timetable[day][slot] = {}

    faculty_workload = defaultdict(lambda: {'weekly': 0, 'daily': defaultdict(int)})
    room_occupied = defaultdict(list)
    section_assigned = defaultdict(lambda: defaultdict(int))

    # Sort allocations: labs first
    allocations.sort(key=lambda x: subjects[x['subject']].endswith('Lab'), reverse=True)

    for alloc in allocations:
        subject_code = alloc['subject']
        faculty_id = alloc['faculty']
        branch = alloc['branch']
        section = alloc['section']
        required_hours = alloc['weekly_hours']

        is_lab = subjects[subject_code].endswith('Lab')
        periods_needed = required_hours // (2 if is_lab else 1)
        consecutive_periods = 2 if is_lab else 1

        target_section = f"{branch}-{section}"

        for _ in range(periods_needed):
            assigned = False
            attempts = 0

            while not assigned and attempts < 200:
                attempts += 1

                day = random.choice(days)
                available_slots = [s for s in slots if s != "12:00"]  # Avoid lunch
                slot = random.choice(available_slots)

                start_idx = slots.index(slot)
                if start_idx + consecutive_periods > len(slots):
                    continue

                consecutive_slots = [slots[start_idx + i] for i in range(consecutive_periods)]

                # Check section availability
                section_free = all(not timetable[day][cs].get(target_section) for cs in consecutive_slots)
                if not section_free:
                    continue

                # Check faculty availability and conflicts
                faculty_free = True
                for cs in consecutive_slots:
                    for other_section, info in timetable[day][cs].items():
                        if info and info.get('faculty') == faculty_id:
                            faculty_free = False
                            break
                    if not faculty_free:
                        break
                if not faculty_free:
                    continue

                # Check room availability
                suitable_room = None
                for room in rooms:
                    room_free = all((day, cs) not in room_occupied[room] for cs in consecutive_slots)
                    if room_free:
                        suitable_room = room
                        break
                if not suitable_room:
                    continue

                # Assign
                for i, cs in enumerate(consecutive_slots):
                    timetable[day][cs][target_section] = {
                        'subject': subject_code,
                        'faculty': faculty_id,
                        'room': suitable_room,
                        'consecutive_part': f"{i+1}/{consecutive_periods}" if consecutive_periods > 1 else None
                    }

                for cs in consecutive_slots:
                    room_occupied[suitable_room].append((day, cs))

                faculty_workload[faculty_id]['daily'][day] += consecutive_periods
                faculty_workload[faculty_id]['weekly'] += consecutive_periods
                section_assigned[target_section][subject_code] += consecutive_periods
                assigned = True

    # Convert to JSON format
    section_timetables = {}
    faculty_timetables = {}

    # Build section timetables
    for branch in config["branches"]:
        for section in config["sections_per_branch"][branch]:
            section_key = f"{branch}-{section}"
            section_timetables[section_key] = {}

            for day in days:
                daily_slots = []
                for slot in slots:
                    if slot == "12:00":
                        daily_slots.append("Lunch")
                    elif slot in timetable[day] and timetable[day][slot].get(section_key):
                        info = timetable[day][slot][section_key]
                        daily_slots.append(info['subject'])
                    else:
                        daily_slots.append("Free")

                section_timetables[section_key][day] = daily_slots

    # Build faculty timetables
    for faculty_id, faculty_info in faculties.items():
        faculty_name = faculty_info['name']
        faculty_timetables[faculty_name] = {}

        for day in days:
            daily_slots = []
            for slot in slots:
                if slot == "12:00":
                    daily_slots.append("Lunch")
                else:
                    found_class = False
                    for section, info in timetable[day][slot].items():
                        if info and info.get('faculty') == faculty_id:
                            daily_slots.append(f"{section}-{info['subject']}")
                            found_class = True
                            break
                    if not found_class:
                        daily_slots.append("Free")

            faculty_timetables[faculty_name][day] = daily_slots

    # Create final JSON structure
    result = {
        "section_timetables": section_timetables,
        "faculty_timetables": faculty_timetables,
        "summary": {
            "total_assignments": sum(len(section_assigned[s]) for s in section_assigned),
            "conflicts": 0,
            "days": days,
            "periods_per_day": len(slots) - 1  # Excluding lunch
        }
    }

    return result

# Generate and output JSON
timetable_data = generate_timetable_json()
print(json.dumps(timetable_data, indent=2))
