import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from '../../utils/axios';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';

const getAuthToken = () => {
  return getToken();
};

const ManageTimetable = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [days] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [timeSlots] = useState([
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ]);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const generateTimetable = async () => {
    try {
      setGenerating(true);
      const response = await axios.post('/api/generate-timetable');
      if (response.data && Array.isArray(response.data.timetable)) {
        setTimetable(response.data.timetable);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Invalid response from server');
      }
      toast.success('Timetable generated successfully');
    } catch (error) {
      console.error('Error generating timetable:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Failed to generate timetable');
    } finally {
      setGenerating(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/timetable');
      if (response.data && Array.isArray(response.data.timetable)) {
        setTimetable(response.data.timetable);
      } else {
        setTimetable(null);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const getSlotContent = (day, timeSlot, groupId) => {
    if (timeSlot === '12:00 PM') {
      return { isBreak: true, message: 'Break Time' };
    }

    if (!timetable || !Array.isArray(timetable)) {
      return null;
    }

    const group = timetable.find(g => g.studentGroup === groupId);
    if (!group || !group.schedule) return null;

    // Get unique subjects from schedule
    const uniqueSubjects = Array.from(new Set(
      group.schedule
        .filter(s => s.subject)
        .map(s => JSON.stringify(s.subject))
    )).map(s => JSON.parse(s));

    console.log('Unique subjects:', uniqueSubjects);

    const slot = group.schedule.find(s => s.day === day && s.timeSlot === timeSlot);
    if (!slot) return null;

    {selectedSlot?.groupSubjects?.map((subject, index) => {
      console.log(subject);  // Add this log to see what subject looks like
      return (
        <option key={index} value={subject._id}>
          {subject.name}
        </option>
      );
    })}

    return {
      subject: slot.subject,
      teacher: slot.teacher,
      classroom: slot.classroom,
        subject: slot.subject,
        teacher: slot.teacher,
        classroom: slot.classroom,
        groupSubjects: uniqueSubjects // These are the unique subjects available for this group
    };
  };

  const openEditModal = (day, time, group) => {
    console.log(group.subjects);
    const currentSlot = getSlotContent(day, time, group.studentGroup);
    setSelectedSlot({ day, time, group });
    setSelectedSubject(currentSlot?.subject || null);
    setIsEditModalOpen(true);
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const saveChanges = async () => {
    try {
      const updatedTimetable = [...timetable];
      const groupIndex = updatedTimetable.findIndex(g => g.studentGroup === selectedSlot.group.studentGroup);
      const group = updatedTimetable[groupIndex];

      const slotIndex = group.schedule.findIndex(
        s => s.day === selectedSlot.day && s.timeSlot === selectedSlot.time
      );
      group.schedule[slotIndex].subject = selectedSubject;

      setTimetable(updatedTimetable);
      toast.success('Timetable updated successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsEditModalOpen(false);
    }
  };

  const content = (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage the class schedule</p>
        </div>
        <button
          onClick={generateTimetable}
          disabled={generating}
          className={`px-4 py-2 rounded-md text-white ${
            generating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {generating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate New Timetable'
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {timetable && timetable.map(group => (
            <div key={group.studentGroup} className="mb-8 bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Group: {group.studentGroup}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Time</th>
                      {days.map(day => (
                        <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timeSlots.map((time, timeIndex) => (
                      <tr key={time} className={timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-inherit border-r">
                          {time}
                        </td>
                        {days.map(day => {
                          const content = getSlotContent(day, time, group.studentGroup);
                          return (
                            <td key={`${day}-${time}`} className="px-6 py-4 cursor-pointer" onClick={() => openEditModal(day, time, group)}>
                              {content?.isBreak ? (
                                <div className="bg-yellow-100 p-3 rounded-lg">
                                  <div className="font-medium text-yellow-800 text-center">Break Time</div>
                                </div>
                              ) : content ? (
                                <div className="space-y-1">
                                  <div className="font-medium text-blue-600">{content.subject?.name || 'No Subject'}</div>
                                  <div className="text-sm text-gray-600">{content.teacher?.name || 'No Teacher'}</div>
                                  <div className="text-xs text-gray-500">Room {content.classroom?.name || 'No Classroom'}</div>
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">No class</div>
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
          ))}

          {(!timetable || timetable.length === 0) && (
            <div className="text-center mt-8 text-gray-500">
              No timetable data available. Click "Generate New Timetable" to create one.
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <Layout>
      {content}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Slot</h2>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Choose Subject</label>
              <select
                id="subject"
                value={selectedSubject || ''}
                onChange={handleSubjectChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              >
                <option value="">Select Subject</option>
                {selectedSlot?.groupSubjects?.map((subject, index) => (
                  <option key={index} value={subject._id}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={saveChanges}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageTimetable;
