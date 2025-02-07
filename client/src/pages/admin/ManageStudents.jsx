import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import axiosInstance from "../../utils/axios";
import toast from "react-hot-toast";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [studentGroups, setStudentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    academicYear: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    metadata: {
      studentGroup: "",
      year: "",
      section: "",
    },
  });

  useEffect(() => {
    fetchStudents();
    fetchStudentGroups();
  }, []);

  const fetchStudentGroups = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/student-groups");
      console.log(response.data)
      setStudentGroups(response.data);
    } catch (error) {
      console.error("Error fetching student groups:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch student groups"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/users/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post("/api/users/students", formData);
      toast.success("Student added successfully");
      fetchStudents();
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "student",
        metadata: {
          studentGroup: "",
          year: "",
          section: "",
        },
      });
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error(error.response?.data?.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!studentId) {
      toast.error('Invalid student ID');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/api/users/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update students list immediately after successful deletion
      setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };


  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post("/api/student-groups", groupFormData);
      toast.success("Student group created successfully");
      fetchStudentGroups();
      setShowGroupModal(false);
      setGroupFormData({ name: "", academicYear: "" });
    } catch (error) {
      console.error("Error creating student group:", error);
      toast.error("Failed to create student group");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("metadata.")) {
      const metadataField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Manage Students</h1>
          <button
            onClick={() => setShowGroupModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Add Student Group
          </button>
        </div>

        {showGroupModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md">
              <h2 className="text-xl font-semibold mb-4">Add Student Group</h2>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    type="text"
                    name="name"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                    className="form-input mt-1 block w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <input
                    type="text"
                    name="academicYear"
                    value={groupFormData.academicYear}
                    onChange={(e) => setGroupFormData({ ...groupFormData, academicYear: e.target.value })}
                    className="form-input mt-1 block w-full"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowGroupModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && <div className="text-center">Loading...</div>}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Add Student Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Student Group
                </label>
                <select
                  name="metadata.studentGroup"
                  value={formData.metadata.studentGroup}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select a group</option>
                  {studentGroups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} - {group.academicYear}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Year
                </label>
                <input
                  type="text"
                  name="metadata.year"
                  value={formData.metadata.year}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Section
                </label>
                <input
                  type="text"
                  name="metadata.section"
                  value={formData.metadata.section}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Student
              </button>
            </form>
          </div>

          {/* Students List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Current Students</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Group</th>
                    <th className="px-4 py-2">Year</th>
                    <th className="px-4 py-2">Section</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id} className="border-b">
                      <td className="px-4 py-2">{student.name}</td>
                      <td className="px-4 py-2">{student.email}</td>
                      <td className="px-4 py-2">
                        {student.metadata?.studentGroup
                          ? `${student.metadata.studentGroup.name} (${student.metadata.studentGroup.academicYear})`
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        {student.metadata?.year || "-"}
                      </td>
                      <td className="px-4 py-2">
                        {student.metadata?.section || "-"}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageStudents;
