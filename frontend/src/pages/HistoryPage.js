import React, { useState, useEffect } from 'react';
import { documents } from '../api/api';
import DocumentPreview from '../components/Dashboard/DocumentPreview';

const HistoryPage = () => {
  const [documentHistory, setDocumentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await documents.getDocumentsHistory();
        setDocumentHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch document history:', err);
        setError('Failed to load document history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleViewDocument = async (docId) => {
    try {
      const response = await documents.getDocumentDetails(docId);
      setSelectedDocument({
        id: response.data.id,
        content: response.data.content,
        type: response.data.document_type,
        title: response.data.title
      });
    } catch (err) {
      console.error('Failed to fetch document details:', err);
      alert('Could not load document details.');
    }
  };

  const handleDownloadPdf = async (docId, title) => {
    try {
      const response = await documents.downloadPdf(docId);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF.');
    }
  };


  if (loading) return <div className="p-6 bg-white shadow rounded-lg"><p>Loading document history...</p></div>;
  if (error) return <div className="p-6 bg-white shadow rounded-lg"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Document History</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gray-50 p-4 rounded-md shadow-inner h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Generated Documents</h2>
          {documentHistory.length === 0 ? (
            <p className="text-gray-500">No documents generated yet.</p>
          ) : (
            <ul className="space-y-2">
              {documentHistory.map((doc) => (
                <li key={doc.id} className="p-3 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                  <div>
                    <span className="font-medium text-indigo-700">{doc.title}</span>
                    <p className="text-xs text-gray-500">{doc.document_type} - {new Date(doc.generation_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDocument(doc.id)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm"
                      title="View Document"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(doc.id, doc.title)}
                      className="text-green-600 hover:text-green-900 text-sm"
                      title="Download PDF"
                    >
                      Download
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2">
          <DocumentPreview document={selectedDocument} onDownloadPdf={() => handleDownloadPdf(selectedDocument.id, selectedDocument.title)} />
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
