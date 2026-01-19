import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || (process.env.REACT_APP_DEMO_MODE ? '' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const auth = {
  login: (username, password) => api.post('/login', { username, password }),
};

export const documents = {
  uploadPdf: (formData) => api.post('/upload-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  generateDocument: (docType, inputs) => api.post('/generate-document', { document_type: docType, inputs }),
  getDocumentsHistory: () => api.get('/documents/history'),
  getDocumentDetails: (docId) => api.get(`/documents/${docId}`),
  downloadPdf: (docId) => api.get(`/documents/${docId}/pdf`, { responseType: 'blob' }),
};

export const timetable = {
  generateDraft: (configId, inputs) => api.post('/timetable/generate', { config_id: configId, inputs }),
  getConfigurations: () => api.get('/timetable/configs'),
  getDrafts: () => api.get('/timetable/drafts'),
  getDraftDetails: (draftId) => api.get(`/timetable/drafts/${draftId}`),
  updateDraft: (draftId, updatedData) => api.put(`/timetable/drafts/${draftId}`, updatedData),
};

// Add other API calls as needed
