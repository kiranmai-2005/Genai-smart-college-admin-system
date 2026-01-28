import React, { useState, useEffect } from 'react';
import { useAdminData } from '../../hooks/useAdminData';

const SubjectManagement = () => {
  const { subjects, setSubjects } = useAdminData();
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    is_lab: false,
    credits: 1,
    required_frequency_per_week: 1,
    lecture_periods: 1,
    lab_periods: 2
  });

  // Debug: Log subjects whenever they change
  useEffect(() => {
    console.log('Subjects in SubjectManagement:', subjects);
  }, [subjects]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.code || !formData.department) {
      alert('Please fill in all required fields (Name, Code, Department)');
      return;
    }

    if (editingSubject) {
      // Update existing subject
      setSubjects(prev => prev.map(sub =>
        sub.id === editingSubject.id ? { ...formData, id: editingSubject.id } : sub
      ));
      console.log('Subject updated:', formData);
    } else {
      // Add new subject
      const newSubject = {
        ...formData,
        id: Date.now() // Simple ID generation for demo
      };
      console.log('Adding new subject:', newSubject);
      setSubjects(prev => {
        const updated = [...prev, newSubject];
        console.log('Updated subjects list:', updated);
        return updated;
      });
    }

    // Reset form
    setFormData({
      name: '',
      code: '',
      department: '',
      is_lab: false,
      credits: 1,
      required_frequency_per_week: 1,
      lecture_periods: 1,
      lab_periods: 2
    });
    setShowForm(false);
    setEditingSubject(null);
  };

  const handleEdit = (subject) => {
    setFormData(subject);
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setSubjects(prev => prev.filter(sub => sub.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      code: '',
      department: '',
      is_lab: false,
      credits: 1,
      required_frequency_per_week: 1,
      lecture_periods: 1,
      lab_periods: 2
    });
    setShowForm(false);
    setEditingSubject(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Subject Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Subject
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingSubject ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Data Structures and Algorithms"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CS301"
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
                  Credits
                </label>
                <input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleInputChange}
                  min="1"
                  max="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_lab"
                checked={formData.is_lab}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                This is a Lab Subject
              </label>
            </div>

            {!formData.is_lab ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lecture Periods per Week
                </label>
                <input
                  type="number"
                  name="lecture_periods"
                  value={formData.lecture_periods}
                  onChange={handleInputChange}
                  min="1"
                  max="6"
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lab Periods (Consecutive)
                </label>
                <input
                  type="number"
                  name="lab_periods"
                  value={formData.lab_periods}
                  onChange={handleInputChange}
                  min="2"
                  max="4"
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Frequency per Week
              </label>
              <input
                type="number"
                name="required_frequency_per_week"
                value={formData.required_frequency_per_week}
                onChange={handleInputChange}
                min="1"
                max="6"
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                How many times this subject should be taught per week
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {editingSubject ? 'Update Subject' : 'Add Subject'}
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

      {/* Subjects List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subjects.map((subject) => (
              <tr key={subject.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                    <div className="text-sm text-gray-500">{subject.code}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {subject.department}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {subject.is_lab ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Lab ({subject.lab_periods} periods)
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Lecture ({subject.lecture_periods} period)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {subject.credits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {subjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No subjects added yet. Click "Add Subject" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;
