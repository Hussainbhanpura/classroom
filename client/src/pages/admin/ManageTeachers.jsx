import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from '../../utils/axios';  
import toast from 'react-hot-toast';
import { getToken } from '../../utils/auth';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentGroups, setStudentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'teacher',
    metadata: {
      subjects: [],
      studentGroup: ''
    }
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    fetchStudentGroups();
  }, [showDeactivated]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchStudentGroups = async () => {
    try {
      const response = await axios.get('/api/student-groups');
      setStudentGroups(response.data);
    } catch (error) {
      console.error('Error fetching student groups:', error);
      toast.error('Failed to fetch student groups');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`/api/users/teachers${showDeactivated ? '?all=true' : ''}`);
      setTeachers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to fetch teachers');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...submitData } = formData;
      await axios.post('/api/register', submitData);
      toast.success('Teacher registered successfully');
      fetchTeachers();
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'teacher',
        metadata: {
          subjects: [],
          studentGroup: ''
        }
      });
      setPasswordError('');
    } catch (error) {
      console.error('Error registering teacher:', error);
      toast.error(error.response?.data?.message || 'Failed to register teacher');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this teacher?')) {
      try {
        await axios.patch(`/api/users/teacher/${id}/deactivate`);
        toast.success('Teacher deactivated successfully');
        fetchTeachers();
      } catch (error) {
        console.error('Error deactivating teacher:', error);
        toast.error(error?.response?.data?.message || 'Failed to deactivate teacher');
      }
    }
  };

  const handleSubjectsChange = (e) => {
    const selectedSubjects = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        subjects: selectedSubjects
      }
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Manage Teachers</h1>

        {/* Add Teacher Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Teacher</h2>
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
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setPasswordError('');
              }}
              className="form-input"
              required
              minLength="6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                setPasswordError('');
              }}
              className={`form-input ${passwordError ? 'border-red-500' : ''}`}
              required
              minLength="6"
              />
              {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Group</label>
              <select
              value={formData.metadata.studentGroup}
              onChange={async (e) => {
                const selectedGroup = e.target.value;
                setFormData({
                ...formData,
                metadata: {
                  ...formData.metadata,
                  studentGroup: selectedGroup,
                  subjects: [] // Reset subjects when group changes
                }
                });

                if (selectedGroup) {
                try {
                  // Find the selected group and its subjects
                  const group = studentGroups.find(g => g._id === selectedGroup);
                  if (group && group.subjects) {
                  // Fetch full subject details if needed
                  const response = await axios.get('/api/subjects', {
                    headers: { Authorization: `Bearer ${getToken()}` }
                  });
                  const allSubjects = response.data;
                  // Filter subjects that belong to the selected group
                  const groupSubjects = allSubjects.filter(subject => 
                    subject.studentGroup && subject.studentGroup._id === selectedGroup
                  );
                  setSubjects(groupSubjects);
                  }
                } catch (error) {
                  console.error('Error fetching subjects for group:', error);
                  toast.error('Failed to fetch subjects for the selected group');
                }
                } else {
                setSubjects([]); // Clear subjects if no group is selected
                }
              }}
              className="form-select"
              required
              >
              <option value="">Select a group</option>
              {studentGroups.map(group => (
                <option key={group._id} value={group._id}>{group.name}</option>
              ))}
              </select>
            </div>
            
            {/* Only show subjects selection if a group is selected */}
            {formData.metadata.studentGroup && (
              <div>
              <label className="block text-sm font-medium text-gray-700">Subjects</label>
              <select
                multiple
                value={formData.metadata.subjects}
                onChange={handleSubjectsChange}
                className="form-multiselect"
                required
              >
                {subjects.map(subject => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add Teacher
            </button>
          </form>
        </div>

        {/* Teachers List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Teachers List</h2>
          <button
            onClick={() => setShowDeactivated(!showDeactivated)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            {showDeactivated ? "Show Active Teachers" : "Show All Teachers"}
          </button>
          </div>
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
                      Subjects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {teachers.map((teacher) => (
                    <tr key={teacher.id} className={teacher.isDeactivated ? 'bg-gray-100' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">{teacher.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{teacher.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {teacher?.subjects?.map(subject => subject.name).join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {teacher?.studentGroup ? 
                          `${teacher.studentGroup.name} (${teacher.studentGroup.academicYear})` 
                          : '-'}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        {!teacher.isDeactivated && (
                          <button
                          onClick={() => handleDelete(teacher.id)}
                          className="text-red-600 hover:text-red-900"
                          >
                          Deactivate
                          </button>
                        )}
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

export default ManageTeachers;