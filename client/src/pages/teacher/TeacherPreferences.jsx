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
  const [selectedOption, setSelectedOption] = useState('preferred');
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

  const handleCellClick = (day, time) => {
    if (isBreakTime(time)) {
      return; // Don't allow changes to break time slots
    }
    setPreferences(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: selectedOption
      }
    }));
  };

  const handleMaxSlotsPerDayChange = (value) => {
    const numValue = parseInt(value);
    if (numValue >= 1 && numValue <= 8) {
      setMaxSlotsPerDay(numValue);
      // Ensure maxSlotsPerWeek is at least equal to maxSlotsPerDay
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
        return '';
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

        {/* Option Selector */}
        <div className="flex space-x-4 mb-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name="preference"
              value="preferred"
              checked={selectedOption === 'preferred'}
              onChange={(e) => setSelectedOption(e.target.value)}
            />
            <span className="ml-2">Preferred</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-red-600"
              name="preference"
              value="not-available"
              checked={selectedOption === 'not-available'}
              onChange={(e) => setSelectedOption(e.target.value)}
            />
            <span className="ml-2">Not Available</span>
          </label>
        </div>

        {/* Legend */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Legend</h3>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-100 rounded mr-2 flex items-center justify-center text-xs">★</span>
              <span className="text-sm text-gray-600">Preferred</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-red-100 rounded mr-2 flex items-center justify-center text-xs">✕</span>
              <span className="text-sm text-gray-600">Not Available</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-gray-50 rounded mr-2"></span>
              <span className="text-sm text-gray-600">Available</span>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="min-w-full divide-y divide-gray-200">
            <div className="bg-gray-50">
              <div className="grid grid-cols-[100px_repeat(8,1fr)] gap-px bg-gray-200">
                <div className="bg-gray-50 p-3"></div>
                {timeSlots.map(time => (
                  <div key={time} className="bg-gray-50 p-3 text-xs font-medium text-gray-500 text-center">
                    {time}
                  </div>
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-200 bg-gray-200">
              {days.map(day => (
                <div key={day} className="grid grid-cols-[100px_repeat(8,1fr)] gap-px">
                  <div className="bg-gray-50 p-3 text-sm font-medium text-gray-500">
                    {day}
                  </div>
                    {timeSlots.map(time => 
                    isBreakTime(time) ? (
                      <div
                      key={`${day}-${time}`}
                      className="bg-yellow-100 p-3 text-center"
                      >
                      <span className="text-yellow-800 text-sm font-medium">
                        Break Time
                      </span>
                      </div>
                    ) : (
                      <div
                      key={`${day}-${time}`}
                      onClick={() => handleCellClick(day, time)}
                      className={`${getCellColor(preferences[day][time])} p-3 text-center cursor-pointer transition-colors duration-150`}
                      >
                      <span className="text-xs">
                        {getCellIcon(preferences[day][time])}
                      </span>
                      </div>
                    )
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>Click on a time slot to mark it as preferred or not available</li>
            <li>All unmarked slots will be considered as available by default</li>
            <li>Set your maximum teaching load per day and week</li>
            <li>Weekly maximum must be at least equal to your daily maximum</li>
            <li>Remember to save your preferences after making changes</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherPreferences;