import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const baseLinkClass = "flex items-center p-4 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors";
  const activeLinkClass = "bg-indigo-100 text-indigo-700 font-semibold";

  return (
    <aside className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 text-2xl font-extrabold text-indigo-800 border-b border-gray-200">
        Admin Panel
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}
        >
          <span className="material-icons mr-3">dashboard</span> {/* Assumes Material Icons or similar */}
          Dashboard
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}
        >
          <span className="material-icons mr-3">history</span>
          Document History
        </NavLink>
        {/* Add more navigation links as needed */}
      </nav>
      <footer className="p-4 text-center text-sm text-gray-500 border-t border-gray-200">
        &copy; {new Date().getFullYear()} Gen-AI College Assistant
      </footer>
    </aside>
  );
};

export default Sidebar;
