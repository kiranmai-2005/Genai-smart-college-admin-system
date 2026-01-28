import React, { useState, useEffect } from 'react';
import { timetable as timetableApi } from '../../api/api';
import { useAdminData } from '../../hooks/useAdminData';
import { sampleTimetableData } from '../../sampleTimetableData';

const TimetableForm = ({ onGenerate }) => {
  const { subjects, faculty, sections, generateSubjectAllocations } = useAdminData();
  const [configurations, setConfigurations] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);
  const [errorConfigs, setErrorConfigs] = useState('');

  // Fetch timetable configurations on component mount
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await timetableApi.getConfigurations();
        setConfigurations(response.data);
        if (response.data.length > 0) {
          setSelectedConfigId(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching timetable configurations:', error);
        setErrorConfigs('Failed to load timetable configurations.');
      } finally {
        setIsLoadingConfigs(false);
      }
    };
    fetchConfigs();
  }, []);

  // Log whenever admin data changes to debug
  useEffect(() => {
    console.log('TimetableForm - Admin data updated:', {
      subjects: subjects.length,
      faculty: faculty.length,
      sections: sections.length,
      subjectDetails: subjects
    });
  }, [subjects, faculty, sections]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedConfigId) {
      alert('Please select a timetable configuration.');
      return;
    }

    // Prepare inputs dynamically from admin data
    const branches = [...new Set(sections.map(s => s.branch))];
    const sectionsPerBranch = sections.reduce((acc, section) => {
      if (!acc[section.branch]) {
        acc[section.branch] = [];
      }
      acc[section.branch].push(section.section);
      return acc;
    }, {});

    // Generate subject allocations based on available data
    const subjectAllocations = generateSubjectAllocations();

    const inputs = {
      target_branches: branches,
      target_sections: sectionsPerBranch,
      faculty_preferences: faculty.reduce((acc, f) => {
        acc[f.employee_id] = f.availability;
        return acc;
      }, {}),
      subject_allocations: subjectAllocations,
      // Include additional metadata for better scheduling
      available_subjects: subjects,
      available_faculty: faculty,
      available_sections: sections
    };

    onGenerate(selectedConfigId, inputs);
  };

  if (isLoadingConfigs) {
    return <div className="p-6 bg-white rounded-lg shadow-md"><p>Loading timetable configurations...</p></div>;
  }

  if (errorConfigs) {
    return <div className="p-6 bg-white rounded-lg shadow-md"><p className="text-red-500">{errorConfigs}</p></div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Generate Timetable Draft</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="configId" className="block text-sm font-medium text-gray-700">Select Configuration:</label>
          <select
            id="configId"
            value={selectedConfigId}
            onChange={(e) => setSelectedConfigId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            required
          >
            {configurations.map((config) => (
              <option key={config.id} value={config.id}>
                {config.config_name} ({config.academic_year} {config.semester})
              </option>
            ))}
          </select>
        </div>
        {/*
          In a real application, this section would have extensive forms
          to input and manage:
          - Faculty assignments to subjects
          - Subject credit hours and lab/lecture types
          - Room preferences/allocations
          - Specific faculty availability/unavailability for different slots
          - Manual overrides or initial allocations
          - Constraints like maximum periods per day/week, consecutive lab periods etc.
        */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-md font-semibold mb-2 text-gray-700">Dynamic Timetable Generation:</h3>
          <p className="text-sm text-gray-600 mb-3">
            The timetable will be generated automatically based on the data you entered in the Admin Panel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-800">{subjects.length}</div>
              <div className="text-gray-600">Subjects Available</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-800">{faculty.length}</div>
              <div className="text-gray-600">Faculty Members</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-800">{sections.length}</div>
              <div className="text-gray-600">Sections Created</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            <strong>Note:</strong> The system will automatically assign subjects to faculty based on department compatibility
            and generate optimal allocations for all sections.
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => onGenerate('realtime', {})}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium"
          >
            🚀 Watch Real-time Generation
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none text-sm"
          >
            Generate Static Timetable
          </button>
          <button
            type="button"
            onClick={() => onGenerate(null, { draft_content: sampleTimetableData })}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none text-sm"
          >
            Load Demo Data
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none text-xs"
            title="Refresh page to reload all data"
          >
            ↻ Refresh
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimetableForm;

