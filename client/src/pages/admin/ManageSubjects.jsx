import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import axios from "axios";
import { getToken } from "../../utils/auth";
import toast from "react-hot-toast";

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentGroups, setStudentGroups] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requiredEquipment: [],
    studentGroup: "",
  });
  const [equipmentInput, setEquipmentInput] = useState("");
  const [selectedStudentGroup, setSelectedStudentGroup] = useState(null);

  const commonEquipment = [
    "Whiteboard",
    "Projector",
    "Smart Board",
    "Computer",
    "Speakers",
    "Air Conditioner",
    "Microphone",
    "Lab Equipment",
    "Science Kit",
    "Art Supplies",
  ];

  // Fetch data when the component mounts
  useEffect(() => {
    fetchSubjects();
    fetchStudentGroups();
  }, []);

  const fetchStudentGroups = async () => {
    try {
      setLoading(true);
      const token = getToken(); // Ensure token is fetched here
      const response = await axios.get(
        "http://localhost:3001/api/student-groups",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data); // Verify the response structure
      setStudentGroups(response.data); // Assuming the response contains the student groups
    } catch (error) {
      console.error("Error fetching student groups:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch student groups"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = getToken();
      const response = await axios.get("http://localhost:3001/api/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched subjects:', response.data);
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const equipment = [...formData.requiredEquipment];

      if (equipmentInput.trim()) {
        equipment.push(...equipmentInput.split(",").map((item) => item.trim()));
      }

      // Ensure we have a student group selected
      if (!selectedStudentGroup) {
        toast.error("Please select a student group");
        return;
      }

      const dataToSend = {
        name: formData.name,
        description: formData.description,
        requiredEquipment: Array.from(new Set(equipment)),
        studentGroup: selectedStudentGroup
      };

      console.log('Sending data:', dataToSend);

      const response = await axios.post(
        "http://localhost:3001/api/subjects",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Response:', response.data);
      toast.success("Subject added successfully");
      fetchSubjects();
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        requiredEquipment: [],
        studentGroup: ""
      });
      setEquipmentInput("");
      setSelectedStudentGroup(null);
    } catch (error) {
      console.error("Error adding subject:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Failed to add subject");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        const token = getToken(); // Ensure token is fetched here
        await axios.delete(`http://localhost:3001/api/subjects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Subject deleted successfully");
        fetchSubjects();
      } catch (error) {
        console.error("Error deleting subject:", error);
        toast.error("Failed to delete subject");
      }
    }
  };

  const toggleEquipment = (equipment) => {
    setFormData((prev) => {
      const newEquipment = prev.requiredEquipment.includes(equipment)
        ? prev.requiredEquipment.filter((e) => e !== equipment)
        : [...prev.requiredEquipment, equipment];
      return { ...prev, requiredEquipment: newEquipment };
    });
  };

  const handleStudentGroupChange = (e) => {
    const groupId = e.target.value;
    console.log('Selected group ID:', groupId);
    setSelectedStudentGroup(groupId);
    setFormData(prev => ({
      ...prev,
      studentGroup: groupId
    }));
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
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="form-input"
                rows="3"
              />
            </div>

            {/* Common Equipment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Equipment
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonEquipment.map((equipment) => (
                  <button
                    key={equipment}
                    type="button"
                    onClick={() => toggleEquipment(equipment)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.requiredEquipment.includes(equipment)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
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
                  Selected Equipment: {formData.requiredEquipment.join(", ")}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student Group
              </label>
                <select
                value={selectedStudentGroup || ""}
                onChange={handleStudentGroupChange}
                className="form-input"
                >
                <option value="">Select a student group</option>
                {studentGroups.map((group) => (
                  <option key={group._id} value={group._id}>
                  {group.name} - {group.academicYear}
                  </option>
                ))}
                </select>

            </div>

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
                      Student Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map((subject) => (
                    <tr key={subject._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subject.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subject.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subject.studentGroup?.name ||
                          subject.studentGroup?.academicYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
