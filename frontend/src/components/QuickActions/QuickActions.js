import React, { useRef } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { timetable as timetableApi } from '../../api/api';

const QuickActions = ({ onTimetableGenerated }) => {
  const { subjects, faculty, sections, rooms, setSubjects, setFaculty, setSections, setRooms } = useAdminData();
  const fileInputRef = useRef(null);

  // Generate Timetable
  const handleGenerateTimetable = async () => {
    try {
      if (subjects.length === 0 || faculty.length === 0 || sections.length === 0) {
        alert('⚠️ Please add at least one Subject, Faculty, and Section before generating timetable.');
        return;
      }

      const inputs = {
        target_branches: [...new Set(sections.map(s => s.branch))],
        target_sections: sections.reduce((acc, section) => {
          if (!acc[section.branch]) {
            acc[section.branch] = [];
          }
          acc[section.branch].push(section.section);
          return acc;
        }, {}),
        faculty_preferences: faculty.reduce((acc, f) => {
          acc[f.employee_id] = f.availability;
          return acc;
        }, {}),
        subject_allocations: subjects.map(s => ({
          subject_code: s.code,
          department: s.department,
          is_lab: s.is_lab
        })),
        available_subjects: subjects,
        available_faculty: faculty,
        available_sections: sections,
        available_rooms: rooms
      };

      const response = await timetableApi.generateDraft(1, inputs);
      
      // Store the timetable in localStorage so it can be viewed
      localStorage.setItem('generated_timetable', JSON.stringify({
        timestamp: new Date().toISOString(),
        data: response.data,
        inputs: inputs
      }));
      
      alert('✓ Timetable generated successfully!\n\nCheck the "Timetable Display" section on the Dashboard page to view it.');
      if (onTimetableGenerated) {
        onTimetableGenerated(response.data);
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      alert('Error generating timetable: ' + error.message);
    }
  };

  // Export Data
  const handleExportData = () => {
    const data = {
      export_date: new Date().toISOString(),
      subjects,
      faculty,
      sections,
      rooms
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `college-config-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✓ Configuration exported successfully!');
  };

  // Import Data
  const handleImportData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        
        if (data.subjects) setSubjects(data.subjects);
        if (data.faculty) setFaculty(data.faculty);
        if (data.sections) setSections(data.sections);
        if (data.rooms) setRooms(data.rooms);
        
        alert('✓ Configuration imported successfully!');
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data: Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Reset All
  const handleResetAll = () => {
    if (window.confirm('⚠️ Are you sure you want to clear ALL data? This action cannot be undone!\n\nClick OK to confirm or Cancel to go back.')) {
      if (window.confirm('🚨 Final confirmation: This will delete all subjects, faculty, sections, and rooms. Continue?')) {
        try {
          // Clear all state - these update state directly
          setSubjects([]);
          setFaculty([]);
          setSections([]);
          setRooms([]);
          
          // Clear localStorage keys
          const keysToRemove = [
            'admin_data_subjects',
            'admin_data_faculty',
            'admin_data_sections',
            'admin_data_rooms',
            'generated_timetable'
          ];
          
          keysToRemove.forEach(key => {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              console.error(`Error removing ${key}:`, e);
            }
          });
          
          console.log('✓ Data reset successfully');
          alert('✓ All data has been cleared successfully!');
        } catch (error) {
          console.error('Error during reset:', error);
          alert('Error clearing data: ' + error.message);
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">⚡ Quick Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Generate Timetable */}
        <button
          onClick={handleGenerateTimetable}
          className="px-4 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-md"
        >
          <div className="text-lg font-semibold mb-2">📅 Generate Timetable</div>
          <div className="text-sm text-green-100">Create schedule with current data</div>
        </button>

        {/* Export Data */}
        <button
          onClick={handleExportData}
          className="px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md"
        >
          <div className="text-lg font-semibold mb-2">📥 Export Data</div>
          <div className="text-sm text-blue-100">Download config as JSON</div>
        </button>

        {/* Import Data */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-md"
        >
          <div className="text-lg font-semibold mb-2">📤 Import Data</div>
          <div className="text-sm text-purple-100">Load config from file</div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportData}
          className="hidden"
        />

        {/* Reset All */}
        <button
          onClick={handleResetAll}
          className="px-4 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-md"
        >
          <div className="text-lg font-semibold mb-2">🔄 Reset All</div>
          <div className="text-sm text-red-100">Clear all data (caution!)</div>
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>💡 Tips:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Use <strong>Export Data</strong> to backup your configuration</li>
            <li>Use <strong>Import Data</strong> to restore from backup or share with others</li>
            <li>Use <strong>Generate Timetable</strong> to create a schedule based on current setup</li>
            <li>Use <strong>Reset All</strong> only when you want to start fresh</li>
          </ul>
        </p>
      </div>
    </div>
  );
};

export default QuickActions;
