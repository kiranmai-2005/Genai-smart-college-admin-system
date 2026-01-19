import React, { useState } from 'react';

const TimetableDisplay = ({ timetableData }) => {
  const [viewMode, setViewMode] = useState('sections'); // 'sections' or 'faculty'
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  if (!timetableData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 text-center">No timetable data available</p>
      </div>
    );
  }

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

  // Get all sections and faculty
  const sections = timetableData.section_timetables ? Object.keys(timetableData.section_timetables) : [];
  const faculty = timetableData.faculty_timetables ? Object.keys(timetableData.faculty_timetables) : [];

  // Set default selections
  if (sections.length > 0 && !selectedSection) {
    setSelectedSection(sections[0]);
  }
  if (faculty.length > 0 && !selectedFaculty) {
    setSelectedFaculty(faculty[0]);
  }

  const getSubjectColor = (subject) => {
    return subjectColors[subject] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const renderTimetable = (schedule, title) => {
    return (
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
        <div className="grid grid-cols-8 gap-1 min-w-[800px]">
          {/* Header row */}
          <div className="bg-gray-100 p-3 font-semibold text-gray-700 border border-gray-300 text-center">
            Time/Day
          </div>
          {days.map(day => (
            <div key={day} className="bg-gray-100 p-3 font-semibold text-gray-700 border border-gray-300 text-center">
              {day}
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((timeSlot, index) => (
            <React.Fragment key={timeSlot}>
              <div className="bg-gray-50 p-3 font-medium text-gray-600 border border-gray-300 text-center">
                {timeSlot}
              </div>
              {days.map(day => {
                const subject = schedule && schedule[day] && schedule[day][index] ? schedule[day][index] : 'Free';
                const isLab = subject.includes('Lab') || subject.includes('CSL') || subject.includes('ECL');
                const isLunch = subject === 'Lunch';

                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className={`
                      p-3 border border-gray-300 text-center text-sm font-medium
                      ${getSubjectColor(subject)}
                      ${isLab ? 'ring-2 ring-red-200' : ''}
                      ${isLunch ? 'italic' : ''}
                      hover:shadow-md transition-shadow duration-200
                    `}
                  >
                    <div className="truncate">
                      {subject}
                      {isLab && <span className="ml-1 text-xs">🔬</span>}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionView = () => {
    const currentSection = timetableData.section_timetables?.[selectedSection];
    return renderTimetable(currentSection, `Timetable for ${selectedSection}`);
  };

  const renderFacultyView = () => {
    const currentFaculty = timetableData.faculty_timetables?.[selectedFaculty];
    return renderTimetable(currentFaculty, `Schedule for ${selectedFaculty}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Timetable Display</h2>

        {/* View Mode Toggle */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setViewMode('sections')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'sections'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Section View
          </button>
          <button
            onClick={() => setViewMode('faculty')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'faculty'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Faculty View
          </button>
        </div>

        {/* Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {viewMode === 'sections' ? 'Section' : 'Faculty'}:
          </label>
          <select
            value={viewMode === 'sections' ? selectedSection : selectedFaculty}
            onChange={(e) => {
              if (viewMode === 'sections') {
                setSelectedSection(e.target.value);
              } else {
                setSelectedFaculty(e.target.value);
              }
            }}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {(viewMode === 'sections' ? sections : faculty).map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h4 className="font-semibold text-gray-700 mb-2">Legend:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
              <span>Data Structures</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span>Computer Networks</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded mr-2"></div>
              <span>Digital Logic</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
              <span>Signals & Systems</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span className="flex items-center">DS Lab 🔬</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-indigo-100 border border-indigo-300 rounded mr-2"></div>
              <span className="flex items-center">DLD Lab 🔬</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-50 border border-orange-300 rounded mr-2"></div>
              <span>Lunch Break</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2"></div>
              <span>Free Period</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {timetableData.summary && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <div className="text-2xl font-bold text-green-800">{timetableData.summary.total_assignments || 0}</div>
              <div className="text-sm text-green-600">Total Assignments</div>
            </div>
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <div className="text-2xl font-bold text-red-800">{timetableData.summary.conflicts || 0}</div>
              <div className="text-sm text-red-600">Conflicts</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="text-2xl font-bold text-blue-800">{timetableData.summary.periods_per_day || 0}</div>
              <div className="text-sm text-blue-600">Periods per Day</div>
            </div>
          </div>
        )}

        {/* Timetable */}
        {viewMode === 'sections' ? renderSectionView() : renderFacultyView()}
      </div>

      {/* Download Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => alert('Download functionality will be implemented')}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Download Timetable
        </button>
      </div>
    </div>
  );
};

export default TimetableDisplay;
