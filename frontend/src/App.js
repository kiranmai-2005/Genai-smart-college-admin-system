import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { initializeDemoData } from './setupDemo';
import './index.css';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  useEffect(() => {
    // Initialize demo data if localStorage is empty
    const hasSubjects = localStorage.getItem('admin_data_subjects');
    if (!hasSubjects) {
      console.log('Initializing demo data...');
      initializeDemoData();
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirect unknown routes */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
