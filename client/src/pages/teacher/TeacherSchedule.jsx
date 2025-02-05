import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';

const TeacherSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/teacher/schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedule(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to fetch schedule');
      setLoading(false);
    }
  };

  const getClassForTimeSlot = (day, timeSlot) => {
    return schedule.find(slot => 
      slot.day === day && 
      slot.timeSlot === timeSlot
    );
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

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="p-6 bg-white shadow-sm">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">My Teaching Schedule</h1>
            <p className="text-gray-500 mt-2">View your weekly teaching schedule</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center flex-grow">
            <p className="text-gray-500">Loading schedule...</p>
          </div>
        ) : (
          <div className="flex-grow p-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-md h-[calc(100vh-12rem)] flex flex-col">
                <div className="flex-grow overflow-auto">
                  <table className="min-w-full border-collapse">
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
                                    <div className="text-sm text-gray-600">
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
        )}
      </div>
    </Layout>
  );
};

export default TeacherSchedule;