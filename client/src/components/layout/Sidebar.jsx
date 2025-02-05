import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserRole, removeToken } from '../../utils/auth';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = getUserRole();

  const handleLogout = () => {
    removeToken();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/teachers', label: 'Manage Teachers' },
    { to: '/admin/students', label: 'Manage Students' },
    { to: '/admin/classrooms', label: 'Manage Classrooms' },
    { to: '/admin/subjects', label: 'Manage Subjects' },
    { to: '/admin/timetable', label: 'Manage Timetable' },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Dashboard' },
    { to: '/teacher/schedule', label: 'My Schedule' },
    { to: '/teacher/preferences', label: 'My Preferences' },
    { to: '/teacher/timetable', label: 'View Timetable' },
  ];

  const links = userRole === 'admin' ? adminLinks : teacherLinks;

  return (
    <div className="w-64 bg-white shadow-md h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">School Timetable</h1>
      </div>
      <div className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`block px-4 py-2 rounded-md ${
                  location.pathname === link.to
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;