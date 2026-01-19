import React, { useState } from 'react';
import { documents } from '../../api/api';

const PdfUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a PDF file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('pdf_file', selectedFile);
    // Optionally add metadata, e.g., formData.append('document_type', 'Circular');

    try {
      const response = await documents.uploadPdf(formData);
      onUploadSuccess(response.data);
      setSelectedFile(null); // Clear selected file
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload Historical PDF for RAG</h2>
      <div className="mb-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">Selected file: {selectedFile.name}</p>
        )}
      </div>
      {uploadError && <p className="text-red-500 text-sm mb-4">{uploadError}</p>}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-300"
      >
        {isUploading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
};

export default PdfUpload;
