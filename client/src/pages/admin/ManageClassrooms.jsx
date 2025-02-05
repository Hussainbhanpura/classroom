import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';

const ManageClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    equipment: [],
    isActive: true
  });
  const [equipmentInput, setEquipmentInput] = useState('');

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
    fetchClassrooms();
  }, []);

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
        equipment: Array.from(new Set(equipment)) // Remove duplicates
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
        isActive: true
      });
      setEquipmentInput('');
    } catch (error) {
      console.error('Error adding classroom:', error);
      toast.error('Failed to add classroom');
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
                      <td className="px-6 py-4 whitespace-nowrap">
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
      </div>
    </Layout>
  );
};

export default ManageClassrooms;