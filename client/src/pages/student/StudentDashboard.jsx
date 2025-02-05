import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';
import StudentNavbar from '../../components/navbar/StudentNavbar';
import { FaCalendarAlt, FaUserGraduate, FaSchool } from 'react-icons/fa';

const StudentDashboard = () => {
  const [schedule, setSchedule] = useState([]);
  const [studentGroup, setStudentGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  useEffect(() => {
    fetchSchedule();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSchedule = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/student/schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedule(response.data.schedule);
      setStudentGroup(response.data.studentGroup);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch schedule');
      setLoading(false);
    }
  };

  const getClassForTimeSlot = (day, timeSlot) => {
    return schedule.find(slot => 
      slot.day === day && 
      slot.timeSlot === timeSlot
    );
  };

  const getCurrentClass = () => {
    const currentDay = days[currentTime.getDay() - 1];
    const currentHour = currentTime.getHours();
    const currentTimeSlot = timeSlots.find((slot, index) => {
      const slotHour = parseInt(slot.split(':')[0]) + (slot.includes('PM') && !slot.startsWith('12') ? 12 : 0);
      return slotHour === currentHour;
    });
    
    if (currentDay && currentTimeSlot) {
      return getClassForTimeSlot(currentDay, currentTimeSlot);
    }
    return null;
  };

  const getSlotColor = (slot) => {
    if (!slot) return 'bg-gray-50';
    
    const colors = [
      'bg-blue-100 hover:bg-blue-200',
      'bg-green-100 hover:bg-green-200',
      'bg-yellow-100 hover:bg-yellow-200',
      'bg-purple-100 hover:bg-purple-200',
      'bg-pink-100 hover:bg-pink-200',
      'bg-indigo-100 hover:bg-indigo-200'
    ];
    
    const index = slot.subject.length % colors.length;
    return colors[index];
  };

  const currentClass = getCurrentClass();

  return (
    <div className="min-h-screen bg-gray-100">
      <StudentNavbar />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaUserGraduate className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Student Group</dt>
                      <dd className="text-lg font-medium text-gray-900">{studentGroup || 'Loading...'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaCalendarAlt className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Current Time</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {currentTime.toLocaleTimeString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaSchool className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Current Class</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {currentClass ? `${currentClass.subject} (Room ${currentClass.room})` : 'No class right now'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timetable */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-gray-500">Loading schedule...</div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Weekly Schedule
                </h3>
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden ring-1 ring-black ring-opacity-5">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-32">
                              Day
                            </th>
                            {timeSlots.map(timeSlot => (
                              <th key={timeSlot} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b min-w-[160px]">
                                {timeSlot}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {days.map(day => (
                            <tr key={day}>
                              <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r w-32">
                                {day}
                              </td>
                              {timeSlots.map(timeSlot => {
                                const slot = getClassForTimeSlot(day, timeSlot);
                                return (
                                  <td key={`${day}-${timeSlot}`} className="px-4 py-4 whitespace-nowrap border-r min-w-[160px]">
                                    {slot ? (
                                      <div className={`p-3 rounded-lg ${getSlotColor(slot)}`}>
                                        <div className="font-medium text-gray-900">
                                          {slot.subject}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                          {slot.teacher}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          Room {slot.room}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-16"></div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
