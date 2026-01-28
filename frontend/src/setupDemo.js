// Demo setup script - Run this to populate sample data and test timetable generation

const STORAGE_KEY_PREFIX = 'admin_data_';

// Pre-populated demo data
const demoSubjects = [
  {
    id: 1,
    name: 'Data Structures and Algorithms',
    code: 'CS301',
    department: 'CSE',
    is_lab: false,
    credits: 4,
    required_frequency_per_week: 3,
    lecture_periods: 1,
    lab_periods: null
  },
  {
    id: 2,
    name: 'Computer Networks',
    code: 'CS302',
    department: 'CSE',
    is_lab: false,
    credits: 3,
    required_frequency_per_week: 2,
    lecture_periods: 1,
    lab_periods: null
  },
  {
    id: 3,
    name: 'Database Management Systems',
    code: 'CS303',
    department: 'CSE',
    is_lab: false,
    credits: 4,
    required_frequency_per_week: 3,
    lecture_periods: 1,
    lab_periods: null
  },
  {
    id: 4,
    name: 'Operating Systems',
    code: 'CS304',
    department: 'CSE',
    is_lab: false,
    credits: 4,
    required_frequency_per_week: 3,
    lecture_periods: 1,
    lab_periods: null
  }
];

const demoFaculty = [
  {
    id: 1,
    name: 'Dr. Anya Sharma',
    employee_id: 'F001',
    department: 'CSE',
    max_weekly_workload: 20,
    max_daily_periods: 4,
    availability: {
      Monday: ['09:00-10:00', '10:00-11:00'],
      Tuesday: ['13:00-14:00', '14:00-15:00'],
      Wednesday: [],
      Thursday: ['09:00-10:00', '10:00-11:00', '15:00-16:00'],
      Friday: ['09:00-10:00', '10:00-11:00']
    }
  },
  {
    id: 2,
    name: 'Prof. Ben Carter',
    employee_id: 'F002',
    department: 'CSE',
    max_weekly_workload: 18,
    max_daily_periods: 3,
    availability: {
      Monday: ['13:00-14:00', '14:00-15:00'],
      Tuesday: ['09:00-10:00'],
      Wednesday: ['10:00-11:00', '11:00-12:00'],
      Thursday: [],
      Friday: ['13:00-14:00', '14:00-15:00']
    }
  },
  {
    id: 3,
    name: 'Dr. Cathy Lee',
    employee_id: 'F003',
    department: 'CSE',
    max_weekly_workload: 22,
    max_daily_periods: 5,
    availability: {
      Monday: ['09:00-10:00', '10:00-11:00', '11:00-12:00'],
      Tuesday: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '13:00-14:00'],
      Wednesday: ['09:00-10:00'],
      Thursday: ['13:00-14:00', '14:00-15:00'],
      Friday: ['09:00-10:00', '10:00-11:00']
    }
  }
];

const demoSections = [
  { id: 1, branch: 'CSE', section: 'A', year: '3', semester: 'Fall', student_count: 65 },
  { id: 2, branch: 'CSE', section: 'B', year: '3', semester: 'Fall', student_count: 62 }
];

const demoRooms = [
  {
    id: 1,
    name: 'LH101',
    room_type: 'Lecture Hall',
    capacity: 60,
    is_lab: false,
    building: 'Main Block',
    floor: '1st Floor',
    equipment: ['Projector', 'Whiteboard']
  },
  {
    id: 2,
    name: 'LH102',
    room_type: 'Lecture Hall',
    capacity: 60,
    is_lab: false,
    building: 'Main Block',
    floor: '1st Floor',
    equipment: ['Projector', 'Whiteboard', 'Sound System']
  },
  {
    id: 3,
    name: 'CSE_Lab1',
    room_type: 'Computer Lab',
    capacity: 30,
    is_lab: true,
    building: 'CS Block',
    floor: 'Ground Floor',
    equipment: ['Computers', 'Projector', 'Whiteboard', 'Printer']
  }
];

export const initializeDemoData = () => {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'subjects', JSON.stringify(demoSubjects));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'faculty', JSON.stringify(demoFaculty));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'sections', JSON.stringify(demoSections));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'rooms', JSON.stringify(demoRooms));
    
    console.log('✓ Demo data initialized successfully!');
    console.log('Subjects:', demoSubjects.length);
    console.log('Faculty:', demoFaculty.length);
    console.log('Sections:', demoSections.length);
    console.log('Rooms:', demoRooms.length);
    
    return {
      subjects: demoSubjects,
      faculty: demoFaculty,
      sections: demoSections,
      rooms: demoRooms
    };
  } catch (error) {
    console.error('Error initializing demo data:', error);
    return null;
  }
};

// Export demo data for use
export { demoSubjects, demoFaculty, demoSections, demoRooms };
