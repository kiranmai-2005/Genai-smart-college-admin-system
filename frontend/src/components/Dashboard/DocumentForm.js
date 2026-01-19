import React, { useState } from 'react';

const DocumentForm = ({ onGenerate }) => {
  const [docType, setDocType] = useState('Circular');
  const [title, setTitle] = useState('');
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [department, setDepartment] = useState('');
  const [details, setDetails] = useState(''); // General details for content

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputs = { title, event_name: eventName, date, department, details };
    onGenerate(docType, inputs);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Generate Academic Document</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="docType" className="block text-sm font-medium text-gray-700">Document Type:</label>
          <select
            id="docType"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option>Circular</option>
            <option>Notice</option>
            <option>Event Schedule</option>
            <option>Timetable Draft</option> {/* This is for a document, not the dedicated timetable module */}
            <option>Email Template</option>
          </select>
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Circular for New Student Orientation"
            required
          />
        </div>
        <div>
          <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">Event Name (if applicable):</label>
          <input
            type="text"
            id="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Annual Sports Day"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department:</label>
          <input
            type="text"
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Academics, Examination, Cultural"
            required
          />
        </div>
        <div>
          <label htmlFor="details" className="block text-sm font-medium text-gray-700">Specific Details / Content Points:</label>
          <textarea
            id="details"
            rows="5"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Provide key information, instructions, or points to be included in the document. The LLM will elaborate on these."
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
        >
          Generate Document
        </button>
      </form>
    </div>
  );
};

export default DocumentForm;
