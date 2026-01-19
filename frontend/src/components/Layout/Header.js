import React from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-indigo-700">College Admin Assistant</div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
