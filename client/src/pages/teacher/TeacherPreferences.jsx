import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';

const TeacherPreferences = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  // Initialize preferences grid
  const initialPreferences = {};
  days.forEach(day => {
    initialPreferences[day] = {};
    timeSlots.forEach(time => {
      initialPreferences[day][time] = 'available'; // default state
    });
  });

  const [preferences, setPreferences] = useState(initialPreferences);
  const [maxSlotsPerDay, setMaxSlotsPerDay] = useState(6);
  const [maxSlotsPerWeek, setMaxSlotsPerWeek] = useState(25);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data) {
        if (response.data.availableTimeSlots) {
          setPreferences(response.data.availableTimeSlots);
        }
        if (response.data.maxSlotsPerDay) {
          setMaxSlotsPerDay(response.data.maxSlotsPerDay);
        }
        if (response.data.maxSlotsPerWeek) {
          setMaxSlotsPerWeek(response.data.maxSlotsPerWeek);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to fetch preferences');
    }
  };

  const isBreakTime = (timeSlot) => timeSlot === '12:00 PM';

  const countUnavailableSlots = () => {
    let count = 0;
    Object.values(preferences).forEach(dayPrefs => {
      Object.values(dayPrefs).forEach(pref => {
        if (pref === 'not-available') count++;
      });
    });
    return count;
  };

  const handleCellClick = (day, time) => {
    if (isBreakTime(time)) return;

    const currentValue = preferences[day][time];
    let newValue;

    // Toggle between states: available -> preferred -> not-available -> available
    if (currentValue === 'available') {
      newValue = 'preferred';
    } else if (currentValue === 'preferred') {
      // Check if we can mark another slot as unavailable
      if (countUnavailableSlots() >= 5 && currentValue !== 'not-available') {
        toast.error('You can only mark up to 5 slots as unavailable');
        return;
      }
      newValue = 'not-available';
    } else {
      newValue = 'available';
    }

    setPreferences(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: newValue
      }
    }));
  };

  const handleMaxSlotsPerDayChange = (value) => {
    const numValue = parseInt(value);
    if (numValue >= 1 && numValue <= 8) {
      setMaxSlotsPerDay(numValue);
      if (maxSlotsPerWeek < numValue) {
        setMaxSlotsPerWeek(numValue);
      }
    }
  };

  const handleMaxSlotsPerWeekChange = (value) => {
    const numValue = parseInt(value);
    if (numValue >= maxSlotsPerDay && numValue <= 40) {
      setMaxSlotsPerWeek(numValue);
    }
  };

  const savePreferences = async () => {
    try {
      const token = getToken();
      await axios.post('http://localhost:3001/api/preferences', {
        availableTimeSlots: preferences,
        maxSlotsPerDay,
        maxSlotsPerWeek
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const getCellColor = (status) => {
    switch (status) {
      case 'preferred':
        return 'bg-green-100 hover:bg-green-200';
      case 'not-available':
        return 'bg-red-100 hover:bg-red-200';
      default:
        return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  const getCellIcon = (status) => {
    switch (status) {
      case 'preferred':
        return '★';
      case 'not-available':
        return '✕';
      default:
        return '✓';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teaching Preferences</h1>
            <p className="text-gray-500 mt-2">Set your preferred teaching hours and availability</p>
          </div>
          <button
            onClick={savePreferences}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Preferences
          </button>
        </div>

        {/* Maximum Slots Settings */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Maximum Teaching Load</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum Slots Per Day</label>
              <input
                type="number"
                min="1"
                max="8"
                value={maxSlotsPerDay}
                onChange={(e) => handleMaxSlotsPerDayChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Between 1 and 8 slots</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum Slots Per Week</label>
              <input
                type="number"
                min={maxSlotsPerDay}
                max="40"
                value={maxSlotsPerWeek}
                onChange={(e) => handleMaxSlotsPerWeekChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Between {maxSlotsPerDay} and 40 slots</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex space-x-6 text-sm">
          <div className="flex items-center">
            <span className="w-4 h-4 bg-gray-50 border border-gray-300 rounded mr-2 flex items-center justify-center text-xs">✓</span>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2 flex items-center justify-center text-xs">★</span>
            <span>Preferred</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2 flex items-center justify-center text-xs">✕</span>
            <span>Not Available (max 5)</span>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                {days.map(day => (
                  <th key={day} className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {time}
                  </td>
                  {days.map(day => (
                    <td
                      key={`${day}-${time}`}
                      onClick={() => handleCellClick(day, time)}
                      className={`px-6 py-4 whitespace-nowrap text-sm cursor-pointer transition-colors duration-150 ${
                        isBreakTime(time)
                          ? 'bg-gray-200 cursor-not-allowed'
                          : getCellColor(preferences[day][time])
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {isBreakTime(time) ? 'Break' : getCellIcon(preferences[day][time])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherPreferences;