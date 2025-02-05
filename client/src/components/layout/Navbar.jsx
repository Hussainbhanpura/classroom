import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { removeToken, getUserRole } from '../../utils/auth';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();

  const handleLogout = () => {
    removeToken();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600' : 'text-gray-600';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">School Timetable System</h1>
            </div>
            {userRole === 'admin' && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/admin/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/admin/dashboard')
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/teachers"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/admin/teachers')
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Manage Teachers
                </Link>
                <Link
                  to="/admin/students"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/admin/students')
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Manage Students
                </Link>
                <Link
                  to="/admin/classrooms"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                    isActive('/admin/classrooms')
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Manage Classrooms
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;