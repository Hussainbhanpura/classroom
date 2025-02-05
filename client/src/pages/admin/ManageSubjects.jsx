import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requiredEquipment: []
  });
  const [equipmentInput, setEquipmentInput] = useState('');

  const commonEquipment = [
    'Whiteboard',
    'Projector',
    'Smart Board',
    'Computer',
    'Speakers',
    'Air Conditioner',
    'Microphone',
    'Lab Equipment',
    'Science Kit',
    'Art Supplies'
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/subjects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      console.log('Token:', token); // Log token
      
      const equipment = [...formData.requiredEquipment];
      if (equipmentInput.trim()) {
        equipment.push(...equipmentInput.split(',').map(item => item.trim()));
      }
      const dataToSend = {
        ...formData,
        requiredEquipment: Array.from(new Set(equipment)) // Remove duplicates
      };
      console.log('Sending data:', dataToSend); // Log data being sent
      
      const response = await axios.post('http://localhost:3001/api/subjects', dataToSend, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      console.log('Response:', response.data); // Log response
      
      toast.success('Subject added successfully');
      fetchSubjects();
      setFormData({
        name: '',
        description: '',
        requiredEquipment: []
      });
      setEquipmentInput('');
    } catch (error) {
      console.error('Error adding subject:', error.response?.data || error); // Log detailed error
      toast.error(error.response?.data?.message || 'Failed to add subject');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const token = getToken();
        await axios.delete(`http://localhost:3001/api/subjects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Subject deleted successfully');
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error('Failed to delete subject');
      }
    }
  };

  const toggleEquipment = (equipment) => {
    setFormData(prev => {
      const newEquipment = prev.requiredEquipment.includes(equipment)
        ? prev.requiredEquipment.filter(e => e !== equipment)
        : [...prev.requiredEquipment, equipment];
      return { ...prev, requiredEquipment: newEquipment };
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Manage Subjects</h1>

        {/* Add Subject Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Subject</h2>
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
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input"
                rows="3"
              />
            </div>
            
            {/* Common Equipment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Equipment</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonEquipment.map((equipment) => (
                  <button
                    key={equipment}
                    type="button"
                    onClick={() => toggleEquipment(equipment)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.requiredEquipment.includes(equipment)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Equipment Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Additional Equipment (comma-separated)
              </label>
              <input
                type="text"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                className="form-input"
                placeholder="e.g., Special Lab Kit, Safety Goggles"
              />
            </div>

            {/* Selected Equipment Preview */}
            {formData.requiredEquipment.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Selected Equipment: {formData.requiredEquipment.join(', ')}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add Subject
            </button>
          </form>
        </div>

        {/* Subjects List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Subjects List</h2>
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
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Required Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map((subject) => (
                    <tr key={subject._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{subject.name}</td>
                      <td className="px-6 py-4">{subject.description}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {subject.requiredEquipment.map((equipment, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full"
                            >
                              {equipment}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(subject._id)}
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

export default ManageSubjects;