import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    totalClasses: 0,
    totalHours: 0,
    differentClasses: 0,
    freePeriods: 0
  });

  useEffect(() => {
    fetchTodaySchedule();
    fetchWeeklyStats();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/timetable', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter today's schedule
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todayClasses = response.data.filter(slot => slot.day === today);
      setTodaySchedule(todayClasses);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to fetch today\'s schedule');
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/timetable', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Calculate weekly stats
      const stats = {
        totalClasses: response.data.length,
        totalHours: response.data.length, // Assuming 1 hour per class
        differentClasses: new Set(response.data.map(slot => slot.studentGroup?.name)).size,
        freePeriods: 40 - response.data.length // Assuming 8 hours * 5 days = 40 total slots
      };
      
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      toast.error('Failed to fetch weekly statistics');
    }
  };

  const navigationCards = [
    {
      title: 'My Schedule',
      description: 'View and manage your teaching schedule',
      path: '/teacher/schedule',
      color: 'bg-blue-500',
    },
    {
      title: 'My Preferences',
      description: 'Set your teaching preferences and availability',
      path: '/teacher/preferences',
      color: 'bg-green-500',
    },
    {
      title: 'View Timetable',
      description: 'View the complete school timetable',
      path: '/teacher/timetable',
      color: 'bg-purple-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome to your teaching portal</p>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {navigationCards.map((card) => (
            <div
              key={card.path}
              onClick={() => navigate(card.path)}
              className={`${card.color} rounded-lg shadow-lg p-6 text-white cursor-pointer transform transition-transform hover:scale-105`}
            >
              <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
              <p className="text-white/80">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">
                      {slot.subject} - {slot.studentGroup?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Room {slot.classroomId?.name} • {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                  <span className={`px-2 py-1 ${
                    index === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  } rounded-full text-sm`}>
                    {index === 0 ? 'Next Class' : 'Upcoming'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No classes scheduled for today</p>
            )}
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-500">Total Classes</h3>
                <p className="text-2xl font-semibold text-gray-900">{weeklyStats.totalClasses}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-500">Total Hours</h3>
                <p className="text-2xl font-semibold text-gray-900">{weeklyStats.totalHours}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-500">Different Classes</h3>
                <p className="text-2xl font-semibold text-gray-900">{weeklyStats.differentClasses}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-500">Free Periods</h3>
                <p className="text-2xl font-semibold text-gray-900">{weeklyStats.freePeriods}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/teacher/preferences')}
                className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-medium">Update Teaching Preferences</h3>
                <p className="text-sm text-gray-500">Set your preferred teaching hours and subjects</p>
              </button>
              <button
                onClick={() => navigate('/teacher/schedule')}
                className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-medium">View Full Schedule</h3>
                <p className="text-sm text-gray-500">See your complete teaching schedule</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
