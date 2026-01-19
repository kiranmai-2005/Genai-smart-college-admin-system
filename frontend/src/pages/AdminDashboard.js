import React, { useState } from 'react';
import SubjectManagement from '../components/Admin/SubjectManagement';
import FacultyManagement from '../components/Admin/FacultyManagement';
import SectionManagement from '../components/Admin/SectionManagement';
import RoomManagement from '../components/Admin/RoomManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('subjects');

  const tabs = [
    { id: 'subjects', name: 'Subjects', icon: '📚', component: SubjectManagement },
    { id: 'faculty', name: 'Faculty', icon: '👨‍🏫', component: FacultyManagement },
    { id: 'sections', name: 'Sections', icon: '🎓', component: SectionManagement },
    { id: 'rooms', name: 'Rooms', icon: '🏫', component: RoomManagement }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || SubjectManagement;

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage subjects, faculty, sections, and rooms for timetable generation</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <ActiveComponent />
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-3 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-left">
            <div className="font-semibold">Generate Timetable</div>
            <div className="text-sm">Create schedule with current data</div>
          </button>
          <button className="p-3 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-left">
            <div className="font-semibold">Export Data</div>
            <div className="text-sm">Download configuration as JSON</div>
          </button>
          <button className="p-3 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-left">
            <div className="font-semibold">Import Data</div>
            <div className="text-sm">Load configuration from file</div>
          </button>
          <button className="p-3 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-left">
            <div className="font-semibold">Reset All</div>
            <div className="text-sm">Clear all data (caution!)</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
