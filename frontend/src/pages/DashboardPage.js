import React, { useState } from 'react';
import PdfUpload from '../components/Dashboard/PdfUpload';
import DocumentForm from '../components/Dashboard/DocumentForm';
import DocumentPreview from '../components/Dashboard/DocumentPreview';
import TimetableForm from '../components/Dashboard/TimetableForm';
import RealtimeTimetableGenerator from '../components/Dashboard/RealtimeTimetableGenerator';
import AdminDashboard from './AdminDashboard';
import { documents, timetable } from '../api/api'; // Import api functions

const DashboardPage = () => {
  const [generatedDocument, setGeneratedDocument] = useState(null);
  const [generatedTimetable, setGeneratedTimetable] = useState(null);
  const [activeTab, setActiveTab] = useState('document'); // 'document', 'timetable', 'admin', 'pdf_upload'
  const [shouldStartRealtime, setShouldStartRealtime] = useState(false);

  const handleDocumentGenerate = async (docType, inputs) => {
    try {
      const response = await documents.generateDocument(docType, inputs);
      setGeneratedDocument({
        id: response.data.document_id,
        content: response.data.generated_text,
        type: docType,
        title: inputs.title || 'Untitled Document'
      });
      setGeneratedTimetable(null); // Clear timetable if generating doc
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to generate document. Check console for details.');
    }
  };

  const handleTimetableGenerate = async (configId, inputs) => {
    try {
      // Handle real-time generation
      if (configId === 'realtime') {
        // Reset timetable and trigger real-time generation
        setGeneratedTimetable(null);
        setGeneratedDocument(null);
        setShouldStartRealtime(true);
        return;
      }

      // Handle sample data loading
      if (!configId && inputs.draft_content) {
        setGeneratedTimetable({
          draft_content: inputs.draft_content,
          xai_logs: [
            {
              log_type: 'choice',
              rule_name: 'Sample_Data_Loaded',
              explanation: 'Sample timetable data loaded successfully for UI demonstration',
              priority: 1
            }
          ]
        });
        setGeneratedDocument(null);
        return;
      }

      console.log('Generating timetable with config:', configId, 'inputs:', inputs);
      const response = await timetable.generateDraft(configId, inputs);
      console.log('Timetable generation response:', response.data);
      
      // Extract the full response including draft_content and xai_logs
      setGeneratedTimetable(response.data);
      setGeneratedDocument(null); // Clear document if generating timetable
      
      // Show success message
      alert('Timetable generated successfully!');
    } catch (error) {
      console.error('Error generating timetable:', error);
      alert('Failed to generate timetable. Check console for details.');
    }
  };

  const handlePdfUploadSuccess = (response) => {
    alert(`PDF uploaded successfully! Document ID: ${response.document_id}`);
    // Optionally update RAG status or trigger a re-fetch
  };

  const downloadGeneratedPdf = async () => {
    if (generatedDocument && generatedDocument.id) {
      try {
        const response = await documents.downloadPdf(generatedDocument.id);
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${generatedDocument.title || 'generated_document'}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Failed to download PDF.');
      }
    } else {
      alert('No document to download.');
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'document' ? 'text-indigo-600 border-indigo-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('document')}
              role="tab"
              aria-selected={activeTab === 'document'}
            >
              Document Generation
            </button>
          </li>
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'timetable' ? 'text-indigo-600 border-indigo-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('timetable')}
              role="tab"
              aria-selected={activeTab === 'timetable'}
            >
              Timetable Draft Generation
            </button>
          </li>
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'admin' ? 'text-indigo-600 border-indigo-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('admin')}
              role="tab"
              aria-selected={activeTab === 'admin'}
            >
              Admin Panel
            </button>
          </li>
          <li className="mr-2" role="presentation">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'pdf_upload' ? 'text-indigo-600 border-indigo-600' : 'hover:text-gray-600 hover:border-gray-300'}`}
              onClick={() => setActiveTab('pdf_upload')}
              role="tab"
              aria-selected={activeTab === 'pdf_upload'}
            >
              Upload PDF for RAG
            </button>
          </li>
        </ul>
      </div>

      <div id="dashboard-content">
        {activeTab === 'document' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <DocumentForm onGenerate={handleDocumentGenerate} />
            </div>
            <div>
              <DocumentPreview document={generatedDocument} onDownloadPdf={downloadGeneratedPdf} />
            </div>
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="space-y-8">
            <div>
              <TimetableForm onGenerate={handleTimetableGenerate} />
            </div>

            {shouldStartRealtime && (
              <div>
                <RealtimeTimetableGenerator
                  timetableData={generatedTimetable?.draft_content}
                  shouldStartRealtime={shouldStartRealtime}
                  onGenerationComplete={(finalTimetable) => {
                    setGeneratedTimetable({
                      draft_content: finalTimetable,
                      xai_logs: [
                        {
                          log_type: 'choice',
                          rule_name: 'Generation_Complete',
                          explanation: 'Real-time timetable generation completed successfully',
                          priority: 1
                        }
                      ]
                    });
                    setShouldStartRealtime(false);
                  }}
                />
              </div>
            )}

            {generatedTimetable && !shouldStartRealtime && generatedTimetable.draft_content && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Generated Timetable</h3>
                {generatedTimetable.draft_content.section_timetables && Object.keys(generatedTimetable.draft_content.section_timetables).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(generatedTimetable.draft_content.section_timetables).map(([section, sectionData]) => (
                      <div key={section} className="border rounded-lg p-4">
                        <h4 className="text-md font-semibold mb-3 text-gray-600">Section: {section}</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr>
                                <th className="border border-gray-300 bg-gray-200 p-2">Time</th>
                                <th className="border border-gray-300 bg-gray-200 p-2">Monday</th>
                                <th className="border border-gray-300 bg-gray-200 p-2">Tuesday</th>
                                <th className="border border-gray-300 bg-gray-200 p-2">Wednesday</th>
                                <th className="border border-gray-300 bg-gray-200 p-2">Thursday</th>
                                <th className="border border-gray-300 bg-gray-200 p-2">Friday</th>
                              </tr>
                            </thead>
                            <tbody>
                              {['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', 'Lunch Break', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00'].map(slot => (
                                <tr key={slot}>
                                  <td className="border border-gray-300 bg-gray-100 p-2 font-medium">{slot}</td>
                                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                    <td key={`${day}-${slot}`} className="border border-gray-300 p-2 text-center bg-blue-50">
                                      {sectionData[day] && sectionData[day][slot] ? sectionData[day][slot] : 'Free'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No timetable data available</p>
                )}
              </div>
            )}

            {generatedTimetable && generatedTimetable.xai_logs && generatedTimetable.xai_logs.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Generation Summary:</h3>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="list-disc pl-5 space-y-1">
                    {generatedTimetable.xai_logs.map((log, index) => (
                      <li key={index} className={`text-sm ${
                        log.log_type === 'conflict' ? 'text-red-600' :
                        log.log_type === 'rejection' ? 'text-orange-500' : 'text-green-600'
                      }`}>
                        <span className="font-semibold">[{log.log_type.toUpperCase()}]</span>{' '}
                        {log.explanation}
                        <span className="text-xs text-gray-500 ml-1">({log.rule_name})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

        {activeTab === 'pdf_upload' && (
          <div>
            <PdfUpload onUploadSuccess={handlePdfUploadSuccess} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
