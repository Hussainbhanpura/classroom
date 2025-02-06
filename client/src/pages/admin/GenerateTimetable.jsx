import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const GenerateTimetable = () => {
  const [studentGroups, setStudentGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Time slots for the timetable
  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsResponse, subjectsResponse] = await Promise.all([
        axios.get("/api/student-groups"),
        axios.get("/api/subjects"),
      ]);

      setStudentGroups(groupsResponse.data);
      setSubjects(subjectsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  };

  const handleGroupChange = (groupId) => {
    setSelectedGroups((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      }
      return [...prev, groupId];
    });
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      }
      return [...prev, subjectId];
    });
  };

  const generateTimetable = async () => {
    if (!selectedGroups.length || !selectedSubjects.length) {
      toast.warning("Please select at least one student group and subject");
      return;
    }

    setLoading(true);
    toast.info("Starting timetable generation. This may take a few minutes...");

    try {
      // Get today's date and end date (5 days from now)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 4);

      const payload = {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        timeSlots,
        studentGroups: selectedGroups,
        subjects: selectedSubjects,
      };

      // Configure axios for long-running request
      const response = await axios.post("/api/generate-timetable", payload, {
        timeout: 900000, // 15 minutes
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      toast.success("Timetable generated successfully!");
      // You can add navigation to view timetable page here
    } catch (error) {
      console.error("Error generating timetable:", error);
      if (error.code === 'ECONNABORTED') {
        toast.error("Timetable generation timed out. Please try again with fewer groups/subjects.");
      } else {
        toast.error("Failed to generate timetable: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Generate Timetable</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Groups Selection */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Select Student Groups</h2>
          <div className="space-y-2">
            {studentGroups.map((group) => (
              <label key={group._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group._id)}
                  onChange={() => handleGroupChange(group._id)}
                  className="form-checkbox"
                />
                <span>{group.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subjects Selection */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Select Subjects</h2>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <label key={subject._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject._id)}
                  onChange={() => handleSubjectChange(subject._id)}
                  className="form-checkbox"
                />
                <span>{subject.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Time Slots Display */}
      <div className="mt-6 border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Time Slots</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {timeSlots.map((slot) => (
            <div key={slot} className="p-2 bg-gray-100 rounded">
              {slot}
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateTimetable}
        disabled={loading || !selectedGroups.length || !selectedSubjects.length}
        className={`mt-6 px-6 py-2 rounded-lg text-white ${
          loading || !selectedGroups.length || !selectedSubjects.length
            ? "bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Generating..." : "Generate Timetable"}
      </button>
    </div>
  );
};

export default GenerateTimetable;
