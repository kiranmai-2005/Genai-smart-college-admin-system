import React from 'react';

const DocumentPreview = ({ document, onDownloadPdf }) => {
  if (!document) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
        <p className="text-gray-500">Generated document will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Generated Document Preview</h2>
      <h3 className="text-lg font-bold mb-2">{document.title} ({document.type})</h3>
      <div className="flex-1 bg-gray-50 p-4 rounded-md shadow-inner overflow-y-auto">
        <p className="text-gray-800 whitespace-pre-wrap">{document.content}</p>
      </div>
      <button
        onClick={onDownloadPdf}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
      >
        Download as PDF
      </button>
    </div>
  );
};

export default DocumentPreview;
