import React, { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';

const FacultyManagement = () => {
  const { faculty, setFaculty } = useAdminData();
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    employee_id: '',
    department: '',
    max_weekly_workload: 20,
    max_daily_periods: 4,
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00'
  ];


  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleAvailabilityChange = (day, slot) => {
    setFormData(prev => {
      const currentSlots = prev.availability[day] || [];
      const isSelected = currentSlots.includes(slot);

      const newSlots = isSelected
        ? currentSlots.filter(s => s !== slot)
        : [...currentSlots, slot].sort();

      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: newSlots
        }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingFaculty) {
      // Update existing faculty
      setFaculty(prev => prev.map(fac =>
        fac.id === editingFaculty.id ? { ...formData, id: editingFaculty.id } : fac
      ));
    } else {
      // Add new faculty
      const newFaculty = {
        ...formData,
        id: Date.now() // Simple ID generation for demo
      };
      setFaculty(prev => [...prev, newFaculty]);
    }

    // Reset form
    setFormData({
      name: '',
      employee_id: '',
      department: '',
      max_weekly_workload: 20,
      max_daily_periods: 4,
      availability: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: []
      }
    });
    setShowForm(false);
    setEditingFaculty(null);
  };

  const handleEdit = (facultyMember) => {
    setFormData(facultyMember);
    setEditingFaculty(facultyMember);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      setFaculty(prev => prev.filter(fac => fac.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      employee_id: '',
      department: '',
      max_weekly_workload: 20,
      max_daily_periods: 4,
      availability: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: []
      }
    });
    setShowForm(false);
    setEditingFaculty(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Faculty Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Faculty
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., F001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="ME">Mechanical (ME)</option>
                  <option value="CE">Civil (CE)</option>
                  <option value="EE">Electrical (EE)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Weekly Workload
                </label>
                <input
                  type="number"
                  name="max_weekly_workload"
                  value={formData.max_weekly_workload}
                  onChange={handleInputChange}
                  min="10"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Daily Periods
                </label>
                <input
                  type="number"
                  name="max_daily_periods"
                  value={formData.max_daily_periods}
                  onChange={handleInputChange}
                  min="2"
                  max="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Availability Schedule */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Weekly Availability Schedule</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">Day</th>
                      {timeSlots.map(slot => (
                        <th key={slot} className="border border-gray-300 px-4 py-2 text-center text-sm">
                          {slot}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(day => (
                      <tr key={day} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">{day}</td>
                        {timeSlots.map(slot => (
                          <td key={slot} className="border border-gray-300 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={formData.availability[day]?.includes(slot) || false}
                              onChange={() => handleAvailabilityChange(day, slot)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Check the boxes for time slots when the faculty member is available to teach.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Faculty List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Faculty Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Workload Limits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {faculty.map((fac) => (
              <tr key={fac.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{fac.name}</div>
                    <div className="text-sm text-gray-500">{fac.employee_id}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {fac.department}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>Weekly: {fac.max_weekly_workload}</div>
                  <div>Daily: {fac.max_daily_periods}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {days.map(day => {
                    const slots = fac.availability[day]?.length || 0;
                    return slots > 0 ? (
                      <div key={day} className="text-xs">
                        {day}: {slots} slots
                      </div>
                    ) : null;
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(fac)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(fac.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {faculty.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No faculty members added yet. Click "Add Faculty" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyManagement;
