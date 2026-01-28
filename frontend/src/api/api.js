import axios from 'axios';

// Mock data for demo mode
const MOCK_DATA = {
  configurations: [
    {
      id: 1,
      config_name: "Fall 2025 Semester Config",
      academic_year: "2025-2026",
      semester: "Fall",
      branches: ["CSE", "ECE"],
      sections_per_branch: { CSE: ["A", "B"], ECE: ["A"] },
      slots_per_day: [
        { start: "09:00", end: "10:00", type: "lecture" },
        { start: "10:00", end: "11:00", type: "lecture" },
        { start: "11:00", end: "12:00", type: "lecture" },
        { start: "12:00", end: "13:00", type: "break" },
        { start: "13:00", end: "14:00", type: "lecture" },
        { start: "14:00", end: "15:00", type: "lecture" },
        { start: "15:00", end: "16:00", type: "lab_lecture_combined" }
      ],
      created_at: "2025-01-28T00:00:00"
    }
  ],
  drafts: [],
  users: [] // Store registered users
};

// Mock API responses
const mockApi = {
  login: (username, password) => 
    new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check hardcoded admin
        if (username === 'admin' && password === 'admin_password') {
          resolve({ data: { access_token: 'demo-token-12345' } });
          return;
        }
        // Check registered users
        const user = MOCK_DATA.users.find(u => u.username === username && u.password === password);
        if (user) {
          resolve({ data: { access_token: `demo-token-${user.id}` } });
        } else {
          reject(new Error('Bad username or password'));
        }
      }, 500);
    }),

  register: (username, password) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if username already exists
        if (username === 'admin' || MOCK_DATA.users.find(u => u.username === username)) {
          reject(new Error('Username already exists'));
          return;
        }
        // Add new user (in demo, store plain password - in production use hashing)
        const newUser = {
          id: MOCK_DATA.users.length + 1,
          username,
          password // In production: use bcrypt.hash()
        };
        MOCK_DATA.users.push(newUser);
        resolve({ data: { message: 'User registered successfully' } });
      }, 500);
    }),

  getConfigurations: () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: MOCK_DATA.configurations });
      }, 300);
    }),

  getDrafts: () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: MOCK_DATA.drafts });
      }, 300);
    }),

  generateDraft: (configId, inputs) =>
    new Promise((resolve) => {
      setTimeout(() => {
        // Generate a complete timetable structure
        const sectionTimetables = {};
        const sections = inputs.available_sections || [];
        
        // Create timetable for each section
        sections.forEach(section => {
          const timetable = {};
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          const slots = ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', 'Lunch Break', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00'];
          
          days.forEach(day => {
            timetable[day] = {};
            slots.forEach((slot, idx) => {
              if (slot === 'Lunch Break') {
                timetable[day][slot] = 'Lunch';
              } else {
                // Randomly assign subjects or mark as free
                const subjects = inputs.available_subjects || [];
                if (subjects.length > 0 && Math.random() > 0.3) {
                  // Randomly select a subject from available subjects
                  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
                  timetable[day][slot] = randomSubject?.name || 'Free';
                } else {
                  timetable[day][slot] = 'Free';
                }
              }
            });
          });
          sectionTimetables[section.section] = timetable;
        });
        
        const newDraft = {
          id: MOCK_DATA.drafts.length + 1,
          config_id: configId,
          status: 'draft',
          created_at: new Date().toISOString(),
          draft_content: {
            section_timetables: sectionTimetables,
            faculty_timetables: {},
            metadata: {
              configuration: configId,
              total_sections: sections.length,
              total_faculty: (inputs.available_faculty || []).length
            }
          },
          xai_logs: [
            {
              log_type: 'choice',
              rule_name: 'Timetable_Generated',
              explanation: 'Timetable generated successfully based on admin data',
              priority: 1
            }
          ]
        };
        MOCK_DATA.drafts.push(newDraft);
        resolve({ data: newDraft });
      }, 1000);
    })
};

// Use mock API if backend is unavailable
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';
const USE_DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

const api = !USE_DEMO_MODE ? axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}) : null;

if (api) {
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
}

export const auth = {
  login: (username, password) => USE_DEMO_MODE
    ? mockApi.login(username, password)
    : api.post('/login', { username, password }),
  register: (username, password) => USE_DEMO_MODE
    ? mockApi.register(username, password)
    : api.post('/register', { username, password }),
};

export const documents = {
  uploadPdf: (formData) => USE_DEMO_MODE
    ? Promise.resolve({ data: { message: 'Mock upload' } })
    : api.post('/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
  generateDocument: (docType, inputs) => USE_DEMO_MODE
    ? Promise.resolve({ data: { id: 1, message: 'Mock generation' } })
    : api.post('/generate-document', { document_type: docType, inputs }),
  getDocumentsHistory: () => USE_DEMO_MODE
    ? Promise.resolve({ data: [] })
    : api.get('/documents/history'),
  getDocumentDetails: (docId) => USE_DEMO_MODE
    ? Promise.resolve({ data: {} })
    : api.get(`/documents/${docId}`),
  downloadPdf: (docId) => USE_DEMO_MODE
    ? Promise.resolve({ data: new Blob() })
    : api.get(`/documents/${docId}/pdf`, { responseType: 'blob' }),
};

export const timetable = {
  generateDraft: (configId, inputs) => USE_DEMO_MODE
    ? mockApi.generateDraft(configId, inputs)
    : api.post('/timetable/generate', { config_id: configId, inputs }),
  getConfigurations: () => USE_DEMO_MODE
    ? mockApi.getConfigurations()
    : api.get('/timetable/configs'),
  getDrafts: () => USE_DEMO_MODE
    ? mockApi.getDrafts()
    : api.get('/timetable/drafts'),
  getDraftDetails: (draftId) => USE_DEMO_MODE
    ? Promise.resolve({ data: MOCK_DATA.drafts.find(d => d.id === parseInt(draftId)) || {} })
    : api.get(`/timetable/drafts/${draftId}`),
  updateDraft: (draftId, updatedData) => USE_DEMO_MODE
    ? Promise.resolve({ data: updatedData })
    : api.put(`/timetable/drafts/${draftId}`, updatedData),
};

// Add other API calls as needed
