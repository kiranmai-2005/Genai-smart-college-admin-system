from app.models import TimetableConfiguration, Faculty, Subject, Room, XaiLog
from datetime import datetime, time
import random
from collections import defaultdict

# Helper to convert time strings to time objects
def parse_time(time_str):
    return datetime.strptime(time_str, '%H:%M').time()

# Helper to check if a slot is a lab slot
def is_lab_slot(slot_details, all_subjects):
    subject_code = slot_details.get('subject')
    if subject_code:
        subject = next((s for s in all_subjects if s.code == subject_code), None)
        return subject and subject.is_lab
    return False

def generate_timetable_draft_with_xai(
    config: TimetableConfiguration,
    inputs: dict,
    all_faculties: list[Faculty],
    all_subjects: list[Subject],
    all_rooms: list[Room]
) -> tuple[dict, list]:
    """
    Generates a draft timetable based on academic constraints and inputs,
    along with an Explainable AI (XAI) log.

    Args:
        config: The timetable configuration object.
        inputs: Admin inputs including target branches/sections, faculty assignments, etc.
        all_faculties: List of all Faculty objects.
        all_subjects: List of all Subject objects.
        all_rooms: List of all Room objects.

    Returns:
        A tuple containing:
            - A dictionary representing the generated timetable draft.
            - A list of XAI log entries.
    """
    draft_timetable = {}
    xai_logs = []

    # Parse config data
    branches = config.branches
    sections_per_branch = config.sections_per_branch
    slots_per_day_config = config.slots_per_day
    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] # Standard academic days

    # Initialize timetable structure
    for day in days_of_week:
        draft_timetable[day] = {}
        for slot_config in slots_per_day_config:
            slot_start = slot_config['start']
            draft_timetable[day][slot_start] = {}
            for branch in branches:
                for section in sections_per_branch.get(branch, []):
                    draft_timetable[day][slot_start][f"{branch}-{section}"] = None # Initially empty

    # --- Prepare Data Structures for Scheduling ---
    faculty_workload = defaultdict(lambda: {'weekly': 0, 'daily': defaultdict(int)}) # {faculty_id: {weekly: int, daily: {day: int}}}
    faculty_assigned_slots = defaultdict(list) # {faculty_id: [(day, slot_start, branch_section)]}
    room_occupied_slots = defaultdict(list) # {room_id: [(day, slot_start)]}
    branch_section_subjects_assigned = defaultdict(lambda: defaultdict(int)) # {branch-section: {subject_code: count}}
    
    # Map for quick lookup
    faculty_map = {f.employee_id: f for f in all_faculties}
    subject_map = {s.code: s for s in all_subjects}
    room_map = {r.name: r for r in all_rooms}

    # Admin Inputs: `subject_allocations` in inputs dict
    # Example: [{"subject_code": "CS301", "faculty_id": "F001", "branch": "CSE", "section": "A", "periods_per_week": 3}]
    subject_allocations = inputs.get('subject_allocations', [])

    # Create a list of all possible slots (day, slot_start, branch-section)
    all_possible_slots = []
    for day in days_of_week:
        for slot_config in slots_per_day_config:
            slot_start = slot_config['start']
            for branch in branches:
                for section in sections_per_branch.get(branch, []):
                    all_possible_slots.append((day, slot_start, f"{branch}-{section}"))

    random.shuffle(all_possible_slots) # Randomize for initial draft generation

    # --- Core Timetable Generation Loop ---
    # Iterate through subject allocations and try to place them
    for allocation in subject_allocations:
        subject_code = allocation['subject_code']
        faculty_id = allocation['faculty']
        branch = allocation['branch']
        section = allocation['section']
        periods_needed = allocation['periods_per_week']

        subject = subject_map.get(subject_code)
        faculty = faculty_map.get(faculty_id)

        if not subject:
            xai_logs.append({
                "log_type": "rejection",
                "rule_name": "Subject_NotFound",
                "slot_details": allocation,
                "explanation": f"Subject with code '{subject_code}' not found. Cannot allocate.",
                "priority": 5
            })
            continue
        if not faculty:
            xai_logs.append({
                "log_type": "rejection",
                "rule_name": "Faculty_NotFound",
                "slot_details": allocation,
                "explanation": f"Faculty with ID '{faculty_id}' not found. Cannot allocate.",
                "priority": 5
            })
            continue

        periods_assigned_for_this_allocation = 0
        target_branch_section = f"{branch}-{section}"

        # Determine if it's a lab and required consecutive periods
        is_current_subject_lab = subject.is_lab
        consecutive_periods_required = subject.lab_periods if is_current_subject_lab else subject.lecture_periods

        attempts = 0
        max_attempts_per_period = 50 # Avoid infinite loops

        while periods_assigned_for_this_allocation < periods_needed and attempts < max_attempts_per_period * periods_needed:
            attempts += 1
            
            # Find a random suitable slot
            day_to_try = random.choice(days_of_week)
            available_slots_for_day = [s for s_config in slots_per_day_config for s in [s_config['start']] if s_config['type'] != 'break']
            
            if not available_slots_for_day:
                continue

            random.shuffle(available_slots_for_day)

            for slot_start_to_try in available_slots_for_day:
                slot_details = {
                    "day": day_to_try,
                    "slot_start": slot_start_to_try,
                    "branch": branch,
                    "section": section,
                    "subject": subject_code,
                    "faculty": faculty_id,
                    "room": None # Will be assigned
                }

                # Check if enough consecutive slots are available for this subject (especially for labs)
                current_slot_index = next((i for i, s in enumerate(slots_per_day_config) if s['start'] == slot_start_to_try), -1)
                if current_slot_index == -1: continue

                potential_consecutive_slots = []
                # Ensure we don't try to place labs in the last period if it's the last possible slot
                if is_current_subject_lab and (current_slot_index + consecutive_periods_required -1) >= len(slots_per_day_config):
                    last_valid_slot_for_lab = len(slots_per_day_config) - consecutive_periods_required
                    if current_slot_index > last_valid_slot_for_lab:
                         xai_logs.append({
                            "log_type": "rejection",
                            "rule_name": "No_Lab_In_Last_Period",
                            "slot_details": slot_details,
                            "explanation": f"Cannot schedule lab {subject_code} starting at {slot_start_to_try} on {day_to_try} because it would extend into or beyond the last period.",
                            "priority": 3
                        })
                         continue # Try next slot
                
                # Check consecutive periods and breaks
                for i in range(consecutive_periods_required):
                    if (current_slot_index + i) >= len(slots_per_day_config):
                        potential_consecutive_slots = []
                        break # Not enough slots in the day
                    
                    next_slot_config = slots_per_day_config[current_slot_index + i]
                    next_slot_start = next_slot_config['start']
                    
                    if next_slot_config['type'] == 'break':
                        potential_consecutive_slots = []
                        xai_logs.append({
                            "log_type": "rejection",
                            "rule_name": "Break_Disruption",
                            "slot_details": slot_details,
                            "explanation": f"Cannot schedule {subject_code} starting at {slot_start_to_try} on {day_to_try} because it would be interrupted by a break at {next_slot_start}.",
                            "priority": 3
                        })
                        break # Cannot span breaks

                    # Check if the branch-section is already occupied in any of these consecutive slots
                    if draft_timetable[day_to_try][next_slot_start].get(target_branch_section) is not None:
                        potential_consecutive_slots = []
                        xai_logs.append({
                            "log_type": "rejection",
                            "rule_name": "Section_Already_Occupied_Consecutive",
                            "slot_details": {**slot_details, "occupied_at": next_slot_start},
                            "explanation": f"Section {target_branch_section} is already occupied at {next_slot_start} on {day_to_try}.",
                            "priority": 2
                        })
                        break
                    
                    potential_consecutive_slots.append(next_slot_start)

                if len(potential_consecutive_slots) < consecutive_periods_required:
                    continue # Not enough consecutive slots, try next start time


                # --- Rule Checks for the chosen slot(s) ---
                is_valid = True
                rejection_reason = []
                
                # 1. Faculty Clash Detection (across all branches/sections)
                for i in range(consecutive_periods_required):
                    check_slot_start = potential_consecutive_slots[i]
                    for bs_key, slot_content in draft_timetable[day_to_try][check_slot_start].items():
                        if slot_content and slot_content.get('faculty') == faculty_id:
                            is_valid = False
                            rejection_reason.append(f"Faculty '{faculty.name}' already teaching '{slot_content['subject']}' in '{bs_key}' at {check_slot_start} on {day_to_try} (Faculty_Clash_Detection).")
                            xai_logs.append({
                                "log_type": "conflict",
                                "rule_name": "Faculty_Clash_Detection",
                                "slot_details": {**slot_details, "conflicting_slot": bs_key, "conflicting_time": check_slot_start, "conflicting_subject": slot_content['subject']},
                                "explanation": f"Faculty '{faculty.name}' is already assigned to another class at {day_to_try} {check_slot_start}.",
                                "priority": 1
                            })
                            break
                    if not is_valid: break

                if not is_valid: continue # Try next slot if faculty clash

                # 2. Faculty Availability Validation
                faculty_available_today = faculty.availability.get(day_to_try, [])
                if not faculty_available_today:
                    is_valid = False
                    rejection_reason.append(f"Faculty '{faculty.name}' is not available on {day_to_try} (Faculty_Availability_Validation).")
                    xai_logs.append({
                        "log_type": "rejection",
                        "rule_name": "Faculty_Availability_Validation",
                        "slot_details": slot_details,
                        "explanation": f"Faculty '{faculty.name}' is marked as unavailable on {day_to_try}.",
                        "priority": 2
                    })
                    continue

                for i in range(consecutive_periods_required):
                    slot_range = f"{potential_consecutive_slots[i]}-{slots_per_day_config[current_slot_index + i]['end']}"
                    if slot_range not in faculty_available_today:
                        is_valid = False
                        rejection_reason.append(f"Faculty '{faculty.name}' is not available at {slot_range} on {day_to_try} (Faculty_Availability_Validation).")
                        xai_logs.append({
                            "log_type": "rejection",
                            "rule_name": "Faculty_Availability_Validation",
                            "slot_details": {**slot_details, "unavailable_time": slot_range},
                            "explanation": f"Faculty '{faculty.name}' is not available during {slot_range} on {day_to_try}.",
                            "priority": 2
                        })
                        break
                
                if not is_valid: continue


                # 3. Maximum periods per faculty per day
                current_daily_periods = faculty_workload[faculty_id]['daily'][day_to_try]
                if (current_daily_periods + consecutive_periods_required) > faculty.max_daily_periods:
                    is_valid = False
                    rejection_reason.append(f"Faculty '{faculty.name}' exceeds max daily periods on {day_to_try} ({current_daily_periods}/{faculty.max_daily_periods} already assigned) (Max_Periods_Per_Faculty_Per_Day).")
                    xai_logs.append({
                        "log_type": "rejection",
                        "rule_name": "Max_Periods_Per_Faculty_Per_Day",
                        "slot_details": slot_details,
                        "explanation": f"Faculty '{faculty.name}' would exceed their maximum daily periods ({faculty.max_daily_periods}) on {day_to_try}.",
                        "priority": 3
                    })
                    continue

                # 4. Maximum workload per faculty per week
                current_weekly_workload = faculty_workload[faculty_id]['weekly']
                if (current_weekly_workload + consecutive_periods_required) > faculty.max_weekly_workload:
                    is_valid = False
                    rejection_reason.append(f"Faculty '{faculty.name}' exceeds max weekly workload ({current_weekly_workload}/{faculty.max_weekly_workload} already assigned) (Max_Workload_Per_Faculty_Per_Week).")
                    xai_logs.append({
                        "log_type": "rejection",
                        "rule_name": "Max_Workload_Per_Faculty_Per_Week",
                        "slot_details": slot_details,
                        "explanation": f"Faculty '{faculty.name}' would exceed their maximum weekly workload ({faculty.max_weekly_workload}).",
                        "priority": 4
                    })
                    continue
                
                # 5. Room and Lab Allocation Constraints
                occupied_room_names = [room_map[rid].name for rid, slots_list in room_occupied_slots.items() for d, s in slots_list if d == day_to_try and s == slot_start_to_try]
                suitable_rooms = [r for r in all_rooms if r.is_lab == is_current_subject_lab and r.name not in occupied_room_names]
                
                if not suitable_rooms:
                    is_valid = False
                    rejection_reason.append(f"No suitable or available room for {'lab' if is_current_subject_lab else 'lecture'} at {slot_start_to_try} on {day_to_try} (Room_Allocation_Constraints).")
                    xai_logs.append({
                        "log_type": "rejection",
                        "rule_name": "Room_Allocation_Constraints",
                        "slot_details": slot_details,
                        "explanation": f"No suitable {'lab' if is_current_subject_lab else 'lecture'} room available for {subject_code} at {day_to_try} {slot_start_to_try}.",
                        "priority": 4
                    })
                    continue
                
                # Pick a random suitable room
                chosen_room = random.choice(suitable_rooms)
                slot_details['room'] = chosen_room.name


                # If all rules pass for this slot
                if is_valid:
                    # Assign the slot and update workloads
                    for i in range(consecutive_periods_required):
                        assign_slot_start = potential_consecutive_slots[i]
                        # Update the timetable draft for this specific branch-section
                        draft_timetable[day_to_try][assign_slot_start][target_branch_section] = {
                            "subject": subject_code,
                            "faculty": faculty_id,
                            "room": chosen_room.name,
                            "consecutive_part": f"{i+1}/{consecutive_periods_required}" if consecutive_periods_required > 1 else None
                        }
                        faculty_workload[faculty_id]['daily'][day_to_try] += 1
                        faculty_workload[faculty_id]['weekly'] += 1
                        room_occupied_slots[chosen_room.id].append((day_to_try, assign_slot_start))
                        faculty_assigned_slots[faculty_id].append((day_to_try, assign_slot_start, target_branch_section))
                    
                    periods_assigned_for_this_allocation += consecutive_periods_required
                    branch_section_subjects_assigned[target_branch_section][subject_code] += consecutive_periods_required

                    xai_logs.append({
                        "log_type": "choice",
                        "rule_name": "Slot_Assignment_Success",
                        "slot_details": slot_details,
                        "explanation": f"Assigned {subject_code} to {target_branch_section} with {faculty.name} in {chosen_room.name} starting at {day_to_try} {slot_start_to_try} for {consecutive_periods_required} periods.",
                        "priority": 1
                    })
                    break # Break from trying slots, move to next period needed
            
            # If after trying all slots for this period, we couldn't assign
            if periods_assigned_for_this_allocation < periods_needed and attempts % max_attempts_per_period == 0:
                 xai_logs.append({
                    "log_type": "rejection",
                    "rule_name": "No_Available_Slot_Found",
                    "slot_details": allocation,
                    "explanation": f"Could not find a suitable slot for {subject_code} for {target_branch_section} for {periods_needed - periods_assigned_for_this_allocation} more periods after multiple attempts.",
                    "priority": 5
                })
                 break # Give up on this allocation for now

    # --- Post-generation validation / remaining rules check ---
    # 6. Subject frequency per week (ensure required_frequency_per_week is met)
    for allocation in subject_allocations:
        subject_code = allocation['subject_code']
        branch = allocation['branch']
        section = allocation['section']
        target_branch_section = f"{branch}-{section}"

        subject = subject_map.get(subject_code)
        if not subject: continue # Already logged

        actual_periods_assigned = branch_section_subjects_assigned[target_branch_section][subject_code]
        # This check is simplified. In a real scenario, 'required_frequency_per_week' implies distinct occurrences, not just total periods.
        # For simplicity, we check if at least one period was assigned.
        # A more complex rule would check distinct (day, first_period_of_class)
        if subject.required_frequency_per_week > 0 and actual_periods_assigned == 0:
            xai_logs.append({
                "log_type": "conflict",
                "rule_name": "Subject_Frequency_Per_Week",
                "slot_details": allocation,
                "explanation": f"Subject '{subject.name}' ({subject_code}) for {target_branch_section} was not assigned any periods, but requires {subject.required_frequency_per_week} times per week.",
                "priority": 2
            })
        
    return draft_timetable, xai_logs
