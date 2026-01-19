// Sample timetable data for testing the UI
export const sampleTimetableData = {
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
};
