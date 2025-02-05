import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import axios from '../../utils/axios';  
import toast from 'react-hot-toast';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentGroups, setStudentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    metadata: {
      subjects: [],
      studentGroup: ''
    }
  });

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    fetchStudentGroups();
  }, []);

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
      const response = await axios.get('/api/users/teachers');
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
    try {
      await axios.post('/api/register', formData);
      toast.success('Teacher registered successfully');
      fetchTeachers();
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
        metadata: {
          subjects: [],
          studentGroup: ''
        }
      });
    } catch (error) {
      console.error('Error registering teacher:', error);
      toast.error(error.response?.data?.message || 'Failed to register teacher');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await axios.delete(`/api/users/teacher/${id}`);
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error('Failed to delete teacher');
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
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-input"
                required
                minLength="6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subjects</label>
              <select
                multiple
                value={formData.metadata.subjects}
                onChange={handleSubjectsChange}
                className="form-input h-32"
                required
              >
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple subjects</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Group</label>
              <select
                value={formData.metadata.studentGroup}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: {
                    ...formData.metadata,
                    studentGroup: e.target.value
                  }
                })}
                className="form-input"
              >
                <option value="">Select a student group</option>
                {studentGroups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name} ({group.academicYear})
                  </option>
                ))}
              </select>
            </div>
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
          <h2 className="text-xl font-semibold mb-4">Teachers List</h2>
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
                    <tr key={teacher.id}>
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
                        <button
                          onClick={() => handleDelete(teacher._id)}
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

export default ManageTeachers;