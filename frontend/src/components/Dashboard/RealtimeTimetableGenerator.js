import React, { useState, useEffect, useCallback } from 'react';

const RealtimeTimetableGenerator = ({ timetableData, onGenerationComplete, shouldStartRealtime }) => {
  const [currentTimetable, setCurrentTimetable] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('');
  const [completedSlots, setCompletedSlots] = useState([]);


  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    'Lunch Break',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00'
  ];

  // Color scheme for different subjects
  const subjectColors = {
    'CS301': 'bg-blue-100 text-blue-800 border-blue-300',
    'CS302': 'bg-green-100 text-green-800 border-green-300',
    'EC301': 'bg-purple-100 text-purple-800 border-purple-300',
    'EC302': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'CSL301': 'bg-red-100 text-red-800 border-red-300',
    'ECL301': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'Free': 'bg-gray-50 text-gray-500 border-gray-200',
    'Lunch': 'bg-orange-50 text-orange-700 border-orange-300'
  };

  const getSubjectColor = (subject) => {
    return subjectColors[subject] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Simulate real-time timetable generation
  const generateRealtimeTimetable = useCallback(async () => {
    setIsGenerating(true);
    setCurrentStep(0);
    setProgress(0);
    setCurrentTimetable({});
    setCompletedSlots([]);

    // Initialize empty timetable structure
    const emptyTimetable = {};
    days.forEach(day => {
      emptyTimetable[day] = {};
      timeSlots.forEach(slot => {
        emptyTimetable[day][slot] = {};
      });
    });
    setCurrentTimetable(emptyTimetable);

    // Simulate the generation steps
    const generationSteps = [
      { action: 'Initializing timetable structure...', delay: 500 },
      { action: 'Loading subject data...', delay: 800 },
      { action: 'Loading faculty availability...', delay: 600 },
      { action: 'Loading room information...', delay: 700 },
      { action: 'Analyzing constraints...', delay: 1000 },
      { action: 'Starting allocation process...', delay: 500 },
    ];

    // Execute initial steps
    for (let i = 0; i < generationSteps.length; i++) {
      setCurrentStep(i);
      setCurrentAction(generationSteps[i].action);
      setProgress((i + 1) / (generationSteps.length + 20) * 100);
      await new Promise(resolve => setTimeout(resolve, generationSteps[i].delay));
    }

    // Now simulate assigning subjects to slots one by one
    const sampleAssignments = [
      // Monday
      { day: 'Monday', slot: '09:00 - 10:00', section: 'CSE-A', subject: 'CS301', faculty: 'F001', room: 'LH101', action: 'Assigning CS301 to CSE-A' },
      { day: 'Monday', slot: '10:00 - 11:00', section: 'CSE-A', subject: 'CS302', faculty: 'F003', room: 'LH101', action: 'Assigning CS302 to CSE-A' },
      { day: 'Monday', slot: '11:00 - 12:00', section: 'CSE-A', subject: 'CSL301', faculty: 'F001', room: 'CSE_Lab1', action: 'Assigning Data Structures Lab to CSE-A' },
      { day: 'Monday', slot: '13:00 - 14:00', section: 'CSE-A', subject: 'CSL301', faculty: 'F001', room: 'CSE_Lab1', action: 'Continuing Data Structures Lab' },
      { day: 'Monday', slot: '14:00 - 15:00', section: 'ECE-A', subject: 'EC301', faculty: 'F002', room: 'LH102', action: 'Assigning Digital Logic to ECE-A' },
      { day: 'Monday', slot: '15:00 - 16:00', section: 'ECE-A', subject: 'EC302', faculty: 'F002', room: 'LH102', action: 'Assigning Signals & Systems to ECE-A' },

      // Tuesday
      { day: 'Tuesday', slot: '09:00 - 10:00', section: 'CSE-B', subject: 'CSL301', faculty: 'F003', room: 'CSE_Lab1', action: 'Assigning DS Lab to CSE-B' },
      { day: 'Tuesday', slot: '10:00 - 11:00', section: 'CSE-B', subject: 'CSL301', faculty: 'F003', room: 'CSE_Lab1', action: 'Continuing DS Lab for CSE-B' },
      { day: 'Tuesday', slot: '11:00 - 12:00', section: 'Free', subject: 'Free', action: 'Slot remains free' },
      { day: 'Tuesday', slot: '13:00 - 14:00', section: 'CSE-B', subject: 'CS302', faculty: 'F003', room: 'LH101', action: 'Assigning Computer Networks to CSE-B' },
      { day: 'Tuesday', slot: '14:00 - 15:00', section: 'CSE-A', subject: 'CS301', faculty: 'F001', room: 'LH102', action: 'Assigning CS301 to CSE-A' },

      // Wednesday
      { day: 'Wednesday', slot: '09:00 - 10:00', section: 'Free', subject: 'Free', action: 'Faculty availability conflict - keeping free' },
      { day: 'Wednesday', slot: '10:00 - 11:00', section: 'CSE-B', subject: 'CS301', faculty: 'F001', room: 'LH101', action: 'Assigning CS301 to CSE-B' },
      { day: 'Wednesday', slot: '11:00 - 12:00', section: 'CSE-B', subject: 'CSL301', faculty: 'F003', room: 'CSE_Lab1', action: 'Assigning DS Lab to CSE-B' },
      { day: 'Wednesday', slot: '13:00 - 14:00', section: 'CSE-B', subject: 'CSL301', faculty: 'F003', room: 'CSE_Lab1', action: 'Continuing DS Lab' },
      { day: 'Wednesday', slot: '14:00 - 15:00', section: 'CSE-A', subject: 'CS302', faculty: 'F003', room: 'LH102', action: 'Assigning CS302 to CSE-A' },

      // Thursday
      { day: 'Thursday', slot: '09:00 - 10:00', section: 'Free', subject: 'Free', action: 'Room conflict detected - keeping free' },
      { day: 'Thursday', slot: '10:00 - 11:00', section: 'CSE-B', subject: 'CS301', faculty: 'F001', room: 'LH101', action: 'Assigning CS301 to CSE-B' },
      { day: 'Thursday', slot: '11:00 - 12:00', section: 'CSE-B', subject: 'CS301', faculty: 'F001', room: 'LH101', action: 'Continuing CS301' },
      { day: 'Thursday', slot: '13:00 - 14:00', section: 'Free', subject: 'Free', action: 'No suitable faculty available' },
      { day: 'Thursday', slot: '14:00 - 15:00', section: 'CSE-A', subject: 'CS302', faculty: 'F003', room: 'LH101', action: 'Assigning CS302 to CSE-A' },
      { day: 'Thursday', slot: '15:00 - 16:00', section: 'CSE-A', subject: 'CS301', faculty: 'F001', room: 'LH102', action: 'Assigning CS301 to CSE-A' },

      // Friday
      { day: 'Friday', slot: '09:00 - 10:00', section: 'CSE-A', subject: 'CS301', faculty: 'F001', room: 'LH101', action: 'Assigning CS301 to CSE-A' },
      { day: 'Friday', slot: '10:00 - 11:00', section: 'CSE-A', subject: 'CS301', faculty: 'F001', room: 'LH101', action: 'Continuing CS301' },
      { day: 'Friday', slot: '11:00 - 12:00', section: 'CSE-B', subject: 'CS301', faculty: 'F001', room: 'LH102', action: 'Assigning CS301 to CSE-B' },
      { day: 'Friday', slot: '13:00 - 14:00', section: 'ECE-A', subject: 'ECL301', faculty: 'F002', room: 'ECE_Lab1', action: 'Assigning Digital Logic Lab to ECE-A' },
      { day: 'Friday', slot: '14:00 - 15:00', section: 'ECE-A', subject: 'ECL301', faculty: 'F002', room: 'ECE_Lab1', action: 'Continuing Digital Logic Lab' },
      { day: 'Friday', slot: '15:00 - 16:00', section: 'ECE-A', subject: 'EC302', faculty: 'F002', room: 'LH101', action: 'Assigning Signals & Systems to ECE-A' },
    ];

    // Execute assignments with delays
    for (let i = 0; i < sampleAssignments.length; i++) {
      const assignment = sampleAssignments[i];
      setCurrentStep(generationSteps.length + i);
      setCurrentAction(assignment.action);
      setProgress((generationSteps.length + i + 1) / (generationSteps.length + sampleAssignments.length) * 100);

      // Update the timetable
      setCurrentTimetable(prev => {
        const newTimetable = { ...prev };
        if (!newTimetable[assignment.day][assignment.slot]) {
          newTimetable[assignment.day][assignment.slot] = {};
        }

        if (assignment.subject !== 'Free') {
          newTimetable[assignment.day][assignment.slot][assignment.section] = {
            subject: assignment.subject,
            faculty: assignment.faculty,
            room: assignment.room
          };
        }

        return newTimetable;
      });

      // Add to completed slots
      setCompletedSlots(prev => [...prev, `${assignment.day}-${assignment.slot}`]);

      // Variable delay for realism
      const delay = assignment.subject.includes('Lab') ? 1200 : 800;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Final steps
    setCurrentAction('Finalizing timetable...');
    setProgress(95);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setCurrentAction('Validating constraints...');
    setProgress(98);
    await new Promise(resolve => setTimeout(resolve, 800));

    setCurrentAction('Timetable generation complete!');
    setProgress(100);
    setIsGenerating(false);

    // Call completion callback with final timetable
    if (onGenerationComplete) {
      onGenerationComplete({
        section_timetables: {
          'CSE-A': currentTimetable,
          'CSE-B': currentTimetable,
          'ECE-A': currentTimetable
        },
        faculty_timetables: {},
        summary: {
          total_assignments: sampleAssignments.filter(a => a.subject !== 'Free').length,
          conflicts: 0,
          days: days,
          periods_per_day: 6
        }
      });
    }
  }, [onGenerationComplete]);

  // Auto-start real-time generation when triggered
  useEffect(() => {
    if (shouldStartRealtime && !isGenerating && !currentTimetable.Monday) {
      generateRealtimeTimetable();
    }
  }, [shouldStartRealtime, isGenerating, currentTimetable.Monday, generateRealtimeTimetable]);

  const startGeneration = () => {
    generateRealtimeTimetable();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Real-time Timetable Generation</h2>

        {!isGenerating && !currentTimetable.Monday && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⚡</div>
            <p className="text-lg text-gray-600 mb-4">
              Watch the timetable being generated step by step in real-time!
            </p>
            <button
              onClick={startGeneration}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-semibold"
            >
              🚀 Start Real-time Generation
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Generation Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-800 font-medium">{currentAction}</span>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              Step {currentStep + 1} of ~25 • {completedSlots.length} slots filled
            </div>
          </div>
        )}

        {currentTimetable.Monday && (
          <div className="mb-4 text-center">
            <div className="text-green-600 font-semibold text-lg">✅ Generation Complete!</div>
            <div className="text-sm text-gray-600 mt-1">
              All subjects have been successfully assigned to the timetable
            </div>
          </div>
        )}
      </div>

      {/* Timetable Display */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Time/Day</th>
              {days.map(day => (
                <th key={day} className="border border-gray-300 px-4 py-2 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot, index) => (
              <tr key={timeSlot} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium bg-gray-50">
                  {timeSlot}
                </td>
                {days.map(day => {
                  const slotData = currentTimetable[day]?.[timeSlot] || {};
                  const isCompleted = completedSlots.includes(`${day}-${timeSlot}`);
                  const sections = Object.keys(slotData);

                  return (
                    <td
                      key={`${day}-${timeSlot}`}
                      className={`border border-gray-300 px-2 py-2 text-center min-w-[120px] transition-all duration-500 ${
                        isCompleted ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      {sections.length > 0 ? (
                        <div className="space-y-1">
                          {sections.map(section => {
                            const data = slotData[section];
                            return (
                              <div
                                key={section}
                                className={`text-xs p-1 rounded border ${getSubjectColor(data.subject)}`}
                              >
                                <div className="font-medium">{section}</div>
                                <div>{data.subject}</div>
                                <div className="text-xs opacity-75">{data.room}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">
                          {isCompleted ? 'Free' : 'Processing...'}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-semibold text-gray-800 mb-2">Subject Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
            <span>Data Structures</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span>Computer Networks</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span>DS Lab</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded mr-2"></div>
            <span>Digital Logic</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-50 border border-orange-300 rounded mr-2"></div>
            <span>Lunch Break</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded mr-2"></div>
            <span>Free Period</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeTimetableGenerator;
