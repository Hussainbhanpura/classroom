import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';

const ViewTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/timetable', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Timetable data:', response.data);
      setTimetable(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to fetch timetable');
    }
  };

  const getClassesForDay = (day) => {
    return timetable.filter(slot => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Timetable</h1>
          <p className="text-gray-500 mt-2">View your teaching schedule</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Classes Today</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {getClassesForDay(selectedDay).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Weekly Hours</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {timetable.length} hrs
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Unique Subjects</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {new Set(timetable.map(slot => slot.subject)).size}
            </p>
          </div>
        </div>

        {/* Day selector */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    selectedDay === day
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {day}
              </button>
            ))}
          </nav>
        </div>

        {/* Schedule */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{selectedDay}'s Schedule</h2>
            <div className="space-y-4">
              {getClassesForDay(selectedDay).map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                >
                  <div className="w-32 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {slot.subject}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Room: {slot.classroom}
                        </p>
                        <p className="text-sm text-gray-500">
                          Group: {slot.studentGroup}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          slot.classroom ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {slot.classroom ? 'Scheduled' : 'Room TBA'}
                        </span>
                        {slot.classroomCapacity && (
                          <span className="text-xs text-gray-500">
                            Capacity: {slot.classroomCapacity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {getClassesForDay(selectedDay).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No classes scheduled for {selectedDay}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Legend</h3>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-100 rounded-full mr-2"></span>
              <span className="text-sm text-gray-600">Scheduled</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-100 rounded-full mr-2"></span>
              <span className="text-sm text-gray-600">Room To Be Assigned</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewTimetable;
