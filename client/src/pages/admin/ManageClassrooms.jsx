import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';

const ManageClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    equipment: [],
    isActive: true,
    availability: {}
  });
  const [equipmentInput, setEquipmentInput] = useState('');
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const commonEquipment = [
    'Whiteboard',
    'Projector',
    'Smart Board',
    'Computer',
    'Speakers',
    'Air Conditioner',
    'Microphone'
  ];

  useEffect(() => {
    fetchScheduleConfig();
    fetchClassrooms();
  }, []);

  const fetchScheduleConfig = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/classrooms/schedule-config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimeSlots(response.data.timeSlots);
      setDaysOfWeek(response.data.daysOfWeek);
      
      // Initialize formData availability with all slots available
      const defaultAvailability = {};
      response.data.daysOfWeek.forEach(day => {
        defaultAvailability[day] = {};
        response.data.timeSlots.forEach(slot => {
          defaultAvailability[day][slot] = true;
        });
      });
      setFormData(prev => ({ ...prev, availability: defaultAvailability }));
    } catch (error) {
      console.error('Error fetching schedule configuration:', error);
      toast.error('Failed to fetch schedule configuration');
    }
  };

  const fetchClassrooms = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/classrooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClassrooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast.error('Failed to fetch classrooms');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const equipment = [...formData.equipment];
      if (equipmentInput.trim()) {
        equipment.push(...equipmentInput.split(',').map(item => item.trim()));
      }
      const dataToSend = {
        ...formData,
        equipment: Array.from(new Set(equipment))
      };
      await axios.post('http://localhost:3001/api/classrooms', dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Classroom added successfully');
      fetchClassrooms();
      setFormData({
        name: '',
        capacity: '',
        equipment: [],
        isActive: true,
        availability: { ...formData.availability }
      });
      setEquipmentInput('');
    } catch (error) {
      console.error('Error adding classroom:', error);
      toast.error('Failed to add classroom');
    }
  };

  const handleEdit = (classroom) => {
    setEditingClassroom({
      ...classroom,
      equipment: [...classroom.equipment],
      availability: classroom.availability || {}
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const token = getToken();
      await axios.put(
        `http://localhost:3001/api/classrooms/${editingClassroom._id}`,
        editingClassroom,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Classroom updated successfully');
      fetchClassrooms();
      setShowEditModal(false);
      setEditingClassroom(null);
    } catch (error) {
      console.error('Error updating classroom:', error);
      toast.error('Failed to update classroom');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this classroom?')) {
      try {
        const token = getToken();
        await axios.delete(`http://localhost:3001/api/classrooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Classroom deleted successfully');
        fetchClassrooms();
      } catch (error) {
        console.error('Error deleting classroom:', error);
        toast.error('Failed to delete classroom');
      }
    }
  };

  const toggleEquipment = (equipment) => {
    setFormData(prev => {
      const newEquipment = prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment];
      return { ...prev, equipment: newEquipment };
    });
  };

  const toggleEditEquipment = (equipment) => {
    setEditingClassroom(prev => {
      const newEquipment = prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment];
      return { ...prev, equipment: newEquipment };
    });
  };

  const toggleAvailability = (day, slot) => {
    setEditingClassroom(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [slot]: !prev.availability[day]?.[slot]
        }
      }
    }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Manage Classrooms</h1>

        {/* Add Classroom Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Classroom</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="form-input"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
              <div className="mb-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {commonEquipment.map((equipment) => (
                    <button
                      key={equipment}
                      type="button"
                      onClick={() => toggleEquipment(equipment)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.equipment.includes(equipment)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {equipment}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  placeholder="Add more equipment (comma-separated)"
                  className="form-input"
                />
              </div>
              <div className="text-sm text-gray-500">
                Selected: {formData.equipment.join(', ')}
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 shadow-sm"
                />
                <span className="ml-2 text-sm text-gray-600">Active Classroom</span>
              </label>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add Classroom
            </button>
          </form>
        </div>

        {/* Classrooms List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Classrooms List</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classrooms.map((classroom) => (
                    <tr key={classroom._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{classroom.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{classroom.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {classroom.equipment.join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          classroom.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {classroom.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleEdit(classroom)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(classroom._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingClassroom && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Edit Classroom</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editingClassroom.name}
                    onChange={(e) => setEditingClassroom({ ...editingClassroom, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    value={editingClassroom.capacity}
                    onChange={(e) => setEditingClassroom({ ...editingClassroom, capacity: e.target.value })}
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {commonEquipment.map((equipment) => (
                      <button
                        key={equipment}
                        type="button"
                        onClick={() => toggleEditEquipment(equipment)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          editingClassroom.equipment.includes(equipment)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {equipment}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingClassroom.isActive}
                      onChange={(e) => setEditingClassroom({ ...editingClassroom, isActive: e.target.checked })}
                      className="rounded border-gray-300 shadow-sm"
                    />
                    <span className="ml-2 text-sm text-gray-600">Active Classroom</span>
                  </label>
                </div>

                {/* Availability Matrix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability Schedule</label>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2"></th>
                          {timeSlots.map((slot) => (
                            <th key={slot} className="px-4 py-2 text-xs font-medium text-gray-500">
                              {slot}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {daysOfWeek.map((day) => (
                          <tr key={day}>
                            <td className="px-4 py-2 font-medium">{day}</td>
                            {timeSlots.map((slot) => (
                              <td key={`${day}-${slot}`} className="px-4 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleAvailability(day, slot)}
                                  className={`w-6 h-6 rounded ${
                                    editingClassroom.availability?.[day]?.[slot]
                                      ? 'bg-green-500'
                                      : 'bg-red-500'
                                  }`}
                                  title={`${editingClassroom.availability?.[day]?.[slot] ? 'Available' : 'Not Available'}`}
                                >
                                  <span className="sr-only">
                                    {editingClassroom.availability?.[day]?.[slot] ? 'Available' : 'Not Available'}
                                  </span>
                                </button>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageClassrooms;