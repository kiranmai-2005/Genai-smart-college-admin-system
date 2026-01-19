import React, { useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';

const SectionManagement = () => {
  const { sections, setSections } = useAdminData();
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    branch: '',
    section: '',
    year: '',
    semester: '',
    student_count: 0
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if section already exists
    const existingSection = sections.find(s =>
      s.branch === formData.branch &&
      s.section === formData.section &&
      s.year === formData.year &&
      s.semester === formData.semester &&
      s.id !== editingSection?.id
    );

    if (existingSection) {
      alert('This section already exists!');
      return;
    }

    if (editingSection) {
      // Update existing section
      setSections(prev => prev.map(sec =>
        sec.id === editingSection.id ? { ...formData, id: editingSection.id } : sec
      ));
    } else {
      // Add new section
      const newSection = {
        ...formData,
        id: Date.now() // Simple ID generation for demo
      };
      setSections(prev => [...prev, newSection]);
    }

    // Reset form
    setFormData({
      branch: '',
      section: '',
      year: '',
      semester: '',
      student_count: 0
    });
    setShowForm(false);
    setEditingSection(null);
  };

  const handleEdit = (section) => {
    setFormData(section);
    setEditingSection(section);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this section? This will affect timetable generation.')) {
      setSections(prev => prev.filter(sec => sec.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({
      branch: '',
      section: '',
      year: '',
      semester: '',
      student_count: 0
    });
    setShowForm(false);
    setEditingSection(null);
  };

  const getSectionsByBranch = () => {
    return sections.reduce((acc, section) => {
      if (!acc[section.branch]) {
        acc[section.branch] = [];
      }
      acc[section.branch].push(section);
      return acc;
    }, {});
  };

  const sectionsByBranch = getSectionsByBranch();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Section Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Section
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingSection ? 'Edit Section' : 'Add New Section'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch *
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="ME">Mechanical (ME)</option>
                  <option value="CE">Civil (CE)</option>
                  <option value="EE">Electrical (EE)</option>
                  <option value="IT">Information Technology (IT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section *
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Semester</option>
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Count
                </label>
                <input
                  type="number"
                  name="student_count"
                  value={formData.student_count}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 65"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Approximate number of students in this section (for room allocation)
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {editingSection ? 'Update Section' : 'Add Section'}
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

      {/* Sections Display - Grouped by Branch */}
      <div className="space-y-6">
        {Object.entries(sectionsByBranch).map(([branch, branchSections]) => (
          <div key={branch} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 mr-3">
                {branch}
              </span>
              {branchSections.length} Section{branchSections.length !== 1 ? 's' : ''}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branchSections.map((section) => (
                <div key={section.id} className="bg-gray-50 p-4 rounded-md border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {section.year}rd Year - Section {section.section}
                      </h4>
                      <p className="text-sm text-gray-600">{section.semester} Semester</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Students:</span> {section.student_count}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Section ID: {section.branch}-{section.section}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-lg">No sections added yet.</p>
            <p className="text-sm">Click "Add Section" to create your first class section.</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {sections.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Sections:</span> {sections.length}
            </div>
            <div>
              <span className="font-medium">Branches:</span> {Object.keys(sectionsByBranch).length}
            </div>
            <div>
              <span className="font-medium">Total Students:</span> {sections.reduce((sum, sec) => sum + sec.student_count, 0)}
            </div>
            <div>
              <span className="font-medium">Avg per Section:</span> {Math.round(sections.reduce((sum, sec) => sum + sec.student_count, 0) / sections.length)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionManagement;
