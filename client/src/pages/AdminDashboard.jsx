import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import TeacherProgressGraph from '../components/graphs/TeacherProgressGraph';
import axios from 'axios';
import { getToken } from '../utils/auth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherProgress();
  }, []);

  const fetchTeacherProgress = async () => {
    try {
      const token = getToken();
      const response = await axios.get(
        'http://localhost:3001/api/teacher-progress',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTeacherData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teacher progress:', error);
      setLoading(false);
    }
  };

  const navigationCards = [
    {
      title: 'Manage Teachers',
      description: 'Add, edit, or remove teachers from the system',
      path: '/admin/teachers',
      color: 'bg-blue-500',
    },
    {
      title: 'Manage Students',
      description: 'Add, edit, or remove students from the system',
      path: '/admin/students',
      color: 'bg-indigo-500',
    },
    {
      title: 'Manage Classrooms',
      description: 'Manage classroom information and availability',
      path: '/admin/classrooms',
      color: 'bg-green-500',
    },
    {
      title: 'Manage Subjects',
      description: 'Configure subjects and their requirements',
      path: '/admin/subjects',
      color: 'bg-purple-500',
    },
    {
      title: 'Manage Timetable',
      description: 'Generate and manage school timetable',
      path: '/admin/timetable',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome to the admin dashboard</p>
        </div>

        {/* Teacher Progress Graph */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Teacher Lecture Progress</h2>
          <div className="w-full overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : teacherData.length > 0 ? (
              <TeacherProgressGraph data={teacherData} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                No teacher data available. Please add teachers and assign them to the timetable.
              </div>
            )}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {navigationCards.map((card, index) => (
            <div
              key={index}
              className={`${card.color} rounded-lg shadow-md p-6 text-white cursor-pointer transform transition-transform duration-200 hover:scale-105`}
              onClick={() => navigate(card.path)}
            >
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm opacity-90">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">New Teacher Added</h3>
                <p className="text-sm text-gray-500">John Doe was added as a Mathematics teacher</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Timetable Generated</h3>
                <p className="text-sm text-gray-500">Weekly timetable was generated for all classes</p>
              </div>
              <span className="text-sm text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Classroom Updated</h3>
                <p className="text-sm text-gray-500">Room 101 equipment list was updated</p>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Teachers</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Timetable Generator</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Running</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Connected</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/admin/teachers')}
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                Add New Teacher
              </button>
              <button
                onClick={() => navigate('/admin/timetable')}
                className="w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
              >
                Generate Timetable
              </button>
              <button
                onClick={() => navigate('/admin/classrooms')}
                className="w-full px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
              >
                Add Classroom
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teacher schedule conflict detected</p>
                  <span className="text-xs text-gray-500">10 minutes ago</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room 102 needs maintenance</p>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weekly timetable generation completed</p>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
