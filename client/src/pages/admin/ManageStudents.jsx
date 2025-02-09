import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import axiosInstance from "../../utils/axios";
import toast from "react-hot-toast";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [studentGroups, setStudentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    academicYear: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    metadata: {
      studentGroup: "",
      year: "",
      batch: "",
    },

  });
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batches, setBatches] = useState([]);
  const [batchFormData, setBatchFormData] = useState({
    studentGroup: "",
    name: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchStudentGroups();
  }, [showDeactivated]);

  const fetchStudentGroups = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/student-groups");
      console.log(response.data);
      setStudentGroups(response.data);
    } catch (error) {
      console.error("Error fetching student groups:", error);
      toast.error(error.response?.data?.message || "Failed to fetch student groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/users/students${showDeactivated ? '?all=true' : ''}`);
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
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword, ...dataToSend } = formData;
      await axiosInstance.post("/api/users/students", dataToSend);
      toast.success("Student added successfully");
      fetchStudents();
        setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
        metadata: {
          studentGroup: "",
          year: "",
          batch: "",
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
      await axiosInstance.patch(`/api/users/students/${studentId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update students list immediately after successful deactivation
      setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
      toast.success('Student deactivated successfully');
    } catch (error) {
      console.error('Error deactivating student:', error);
      toast.error(error.response?.data?.message || 'Failed to deactivate student');
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

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const groupId = batchFormData.studentGroup;
      const response = await axiosInstance.post(`/api/student-groups/${groupId}/batches`, {
        name: batchFormData.name
      });
      toast.success('Batch created successfully!');
      fetchStudentGroups();
      setShowBatchModal(false);
      setBatchFormData({ studentGroup: '', name: '' });
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error(error.response?.data?.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("metadata.")) {
      const metadataField = name.split(".")[1];
      if (name === "metadata.studentGroup") {
        setFormData((prev) => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            studentGroup: value,
          },
        }));
        // Fetch batches for the selected student group
        if (value) {
          const fetchBatches = async () => {
            try {
              const response = await axiosInstance.get(`/api/student-groups/${value}/batches`);
              setBatches(response.data);
            } catch (error) {
              console.error("Error fetching batches:", error);
              toast.error("Failed to fetch batches");
            }
          };
          fetchBatches();
        } else {
          setBatches([]);
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            [metadataField]: value,
          },
        }));
      }
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
            onClick={() => setShowBatchModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mb-2"
          >
            Add Batch
          </button>
          <button
            onClick={() => setShowGroupModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Add Student Group
          </button>
        </div>

        {showBatchModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md">
              <h2 className="text-xl font-semibold mb-4">Add Batch</h2>
              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Group</label>
                  <select
                    name="studentGroup"
                    value={batchFormData.studentGroup}
                    onChange={(e) => setBatchFormData({ ...batchFormData, studentGroup: e.target.value })}
                    className="form-input mt-1 block w-full"
                    required
                  >
                    <option value="">Select a group</option>
                    {studentGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name} - {group.academicYear}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                  <input
                    type="text"
                    name="name"
                    value={batchFormData.name}
                    onChange={(e) => setBatchFormData({ ...batchFormData, name: e.target.value })}
                    className="form-input mt-1 block w-full"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
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
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
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
                  Batch
                </label>
                <select
                  name="metadata.batch"
                  value={formData.metadata.batch}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select a batch</option>
                  {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                  ))}
                </select>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Current Students</h2>
              <button
                onClick={() => setShowDeactivated(!showDeactivated)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                {showDeactivated ? "Show Active Students" : "Show All Students"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Group</th>
                    <th className="px-4 py-2">Year</th>
                    <th className="px-4 py-2">Batch</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student._id}
                      className={`border-b ${student.isDeactivated ? 'bg-gray-100' : ''}`}
                    >
                      <td className="px-4 py-2">{student.name}</td>
                      <td className="px-4 py-2">{student.email}</td>
                      <td className="px-4 py-2">
                        {student.metadata?.studentGroup
                          ? `${student.metadata.studentGroup.name} (${student.metadata.studentGroup.academicYear})`
                          : "-"}
                      </td>
                        <td className="px-4 py-2">{student.metadata?.year || "-"}</td>
                        <td className="px-4 py-2">{student.metadata?.batch || "-"}</td>
                        <td className="px-4 py-2">

                        {!student.isDeactivated && (
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
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
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default ManageStudents;
