// Custom hook for managing admin data across components
import { useState, useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'admin_data_';

const defaultSubjects = [
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
    name: 'Data Structures Lab',
    code: 'CSL301',
    department: 'CSE',
    is_lab: true,
    credits: 2,
    required_frequency_per_week: 1,
    lecture_periods: null,
    lab_periods: 2
  },
  {
    id: 4,
    name: 'Digital Logic Design',
    code: 'EC301',
    department: 'ECE',
    is_lab: false,
    credits: 4,
    required_frequency_per_week: 3,
    lecture_periods: 1,
    lab_periods: null
  },
  {
    id: 5,
    name: 'Digital Logic Design Lab',
    code: 'ECL301',
    department: 'ECE',
    is_lab: true,
    credits: 2,
    required_frequency_per_week: 1,
    lecture_periods: null,
    lab_periods: 2
  }
];

export const useAdminData = () => {
  // Load from localStorage or use defaults
  const [subjects, setSubjectsState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'subjects');
      return stored ? JSON.parse(stored) : defaultSubjects;
    } catch (e) {
      console.error('Error loading subjects from localStorage:', e);
      return defaultSubjects;
    }
  });
  const [faculty, setFacultyState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'faculty');
      return stored ? JSON.parse(stored) : [
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
          department: 'ECE',
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
    } catch (e) {
      console.error('Error loading faculty from localStorage:', e);
      return [];
    }
  });

  const [sections, setSectionsState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'sections');
      return stored ? JSON.parse(stored) : [
        { id: 1, branch: 'CSE', section: 'A', year: '3', semester: 'Fall', student_count: 65 },
        { id: 2, branch: 'CSE', section: 'B', year: '3', semester: 'Fall', student_count: 62 },
        { id: 3, branch: 'ECE', section: 'A', year: '3', semester: 'Fall', student_count: 58 }
      ];
    } catch (e) {
      console.error('Error loading sections from localStorage:', e);
      return [];
    }
  });

  const [rooms, setRoomsState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + 'rooms');
      return stored ? JSON.parse(stored) : [
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
        },
        {
          id: 4,
          name: 'ECE_Lab1',
          room_type: 'Electronics Lab',
          capacity: 25,
          is_lab: true,
          building: 'ECE Block',
          floor: '1st Floor',
          equipment: ['Oscilloscopes', 'Power Supplies', 'Multimeters', 'Projector']
        }
      ];
    } catch (e) {
      console.error('Error loading rooms from localStorage:', e);
      return [];
    }
  });

  // Sync with localStorage - only save effects (loading happens during init)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'subjects', JSON.stringify(subjects));
    } catch (e) {
      console.error('Error saving subjects to localStorage:', e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'faculty', JSON.stringify(faculty));
    } catch (e) {
      console.error('Error saving faculty to localStorage:', e);
    }
  }, [faculty]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'sections', JSON.stringify(sections));
    } catch (e) {
      console.error('Error saving sections to localStorage:', e);
    }
  }, [sections]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'rooms', JSON.stringify(rooms));
    } catch (e) {
      console.error('Error saving rooms to localStorage:', e);
    }
  }, [rooms]);

  // Wrapper functions for setState that also save to localStorage
  const setSubjects = (update) => {
    setSubjectsState(prevState => {
      const newValue = typeof update === 'function' ? update(prevState) : update;
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'subjects', JSON.stringify(newValue));
      } catch (e) {
        console.error('Error saving subjects to localStorage:', e);
      }
      return newValue;
    });
  };

  const setFaculty = (update) => {
    setFacultyState(prevState => {
      const newValue = typeof update === 'function' ? update(prevState) : update;
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'faculty', JSON.stringify(newValue));
      } catch (e) {
        console.error('Error saving faculty to localStorage:', e);
      }
      return newValue;
    });
  };

  const setSections = (update) => {
    setSectionsState(prevState => {
      const newValue = typeof update === 'function' ? update(prevState) : update;
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'sections', JSON.stringify(newValue));
      } catch (e) {
        console.error('Error saving sections to localStorage:', e);
      }
      return newValue;
    });
  };

  const setRooms = (update) => {
    setRoomsState(prevState => {
      const newValue = typeof update === 'function' ? update(prevState) : update;
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'rooms', JSON.stringify(newValue));
      } catch (e) {
        console.error('Error saving rooms to localStorage:', e);
      }
      return newValue;
    });
  };

  // Generate subject allocations for timetable
  const generateSubjectAllocations = () => {
    const allocations = [];

    sections.forEach(section => {
      const sectionSubjects = subjects.filter(sub =>
        sub.department === section.branch || sub.department === 'General'
      );

      sectionSubjects.forEach(subject => {
        // Find suitable faculty for this subject
        const suitableFaculty = faculty.filter(f =>
          f.department === subject.department || f.department === 'General'
        );

        if (suitableFaculty.length > 0) {
          // Assign to first available faculty (in real app, this would be more sophisticated)
          const assignedFaculty = suitableFaculty[0];

          allocations.push({
            subject_code: subject.code,
            faculty: assignedFaculty.employee_id,
            branch: section.branch,
            section: section.section,
            periods_per_week: subject.required_frequency_per_week
          });
        }
      });
    });

    return allocations;
  };

  return {
    subjects,
    setSubjects,
    faculty,
    setFaculty,
    sections,
    setSections,
    rooms,
    setRooms,
    generateSubjectAllocations
  };
};
