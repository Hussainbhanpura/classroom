import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import toast from 'react-hot-toast';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [studentGroups, setStudentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    academicYear: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    metadata: {
      studentGroup: '',
      year: '',
      section: ''
    }
  });

  useEffect(() => {
    fetchStudents();
    fetchStudentGroups();
  }, []);

  const fetchStudentGroups = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/student-groups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentGroups(response.data);
    } catch (error) {
      console.error('Error fetching student groups:', error);
      toast.error('Failed to fetch student groups');
    }
  };

  const fetchStudents = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3001/api/users/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post('http://localhost:3001/api/register', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Student registered successfully');
      fetchStudents();
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        metadata: {
          studentGroup: '',
          year: '',
          section: ''
        }
      });
    } catch (error) {
      console.error('Error registering student:', error);
      toast.error(error.response?.data?.message || 'Failed to register student');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const token = getToken();
        await axios.delete(`http://localhost:3001/api/users/student/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post('http://localhost:3001/api/studentgroups', groupFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Student group created successfully');
      fetchStudentGroups();
      setShowGroupModal(false);
      setGroupFormData({ name: '', academicYear: '' });
    } catch (error) {
      console.error('Error creating student group:', error);
      toast.error('Failed to create student group');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Manage Students</h1>

        {/* Add Student Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
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
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-input"
                required
                minLength="6"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Student Group</label>
                <button
                  type="button"
                  onClick={() => setShowGroupModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add New Group
                </button>
              </div>
              <select
                value={formData.metadata.studentGroup}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, studentGroup: e.target.value }
                  })
                }
                className="form-input"
                required
              >
                <option value="">Select a student group</option>
                {studentGroups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name} ({group.academicYear})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="text"
                value={formData.metadata.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, year: e.target.value }
                  })
                }
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Section</label>
              <input
                type="text"
                value={formData.metadata.section}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, section: e.target.value }
                  })
                }
                className="form-input"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add Student
            </button>
          </form>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Students List</h2>
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.metadata?.studentGroup ? 
                          `${student.metadata.studentGroup.name} (${student.metadata.studentGroup.academicYear})` 
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.metadata?.year || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.metadata?.section || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(student._id)}
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

        {/* Add Student Group Modal */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-semibold mb-4">Add New Student Group</h2>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    type="text"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <input
                    type="text"
                    value={groupFormData.academicYear}
                    onChange={(e) =>
                      setGroupFormData({ ...groupFormData, academicYear: e.target.value })
                    }
                    className="form-input"
                    required
                    placeholder="e.g., 2024-2025"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowGroupModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageStudents;
