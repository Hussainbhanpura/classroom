import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';

const ManageStudentGroups = () => {
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [newGroup, setNewGroup] = useState({
    name: '',
    academicYear: '',
    subjects: []
  });

  // Fetch student groups and subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, subjectsRes] = await Promise.all([
          axios.get('/api/student-groups'),
          axios.get('/api/subjects')
        ]);
        setGroups(groupsRes.data);
        setSubjects(subjectsRes.data.map(subject => ({
          value: subject._id,
          label: `${subject.name} (${subject.lecturesPerWeek || 3} lectures/week)`
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  // Create new student group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/student-groups', {
        ...newGroup,
        subjects: selectedSubjects.map(s => s.value)
      });
      setGroups([...groups, res.data]);
      setNewGroup({ name: '', academicYear: '', subjects: [] });
      setSelectedSubjects([]);
      toast.success('Student group created successfully');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create student group');
    }
  };

  // Update group subjects
  const handleUpdateSubjects = async (groupId) => {
    try {
      const res = await axios.put(`/api/student-groups/${groupId}/subjects`, {
        subjects: selectedSubjects.map(s => s.value)
      });
      setGroups(groups.map(g => g._id === groupId ? res.data : g));
      toast.success('Subjects updated successfully');
    } catch (error) {
      console.error('Error updating subjects:', error);
      toast.error('Failed to update subjects');
    }
  };

  // Handle group selection
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedSubjects(
      group.subjects?.map(subject => ({
        value: subject._id,
        label: `${subject.name} (${subject.lecturesPerWeek || 3} lectures/week)`
      })) || []
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Student Groups</h1>

      {/* Create New Group */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Academic Year</label>
              <input
                type="text"
                value={newGroup.academicYear}
                onChange={(e) => setNewGroup({ ...newGroup, academicYear: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subjects</label>
            <Select
              isMulti
              options={subjects}
              value={selectedSubjects}
              onChange={setSelectedSubjects}
              className="mt-1"
              placeholder="Select subjects..."
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Group
          </button>
        </form>
      </div>

      {/* Manage Existing Groups */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Manage Existing Groups</h2>
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group._id} className="border-b pb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{group.name}</h3>
                  <p className="text-sm text-gray-600">Academic Year: {group.academicYear}</p>
                </div>
                <button
                  onClick={() => handleGroupSelect(group)}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200"
                >
                  Edit Subjects
                </button>
              </div>
              {selectedGroup?._id === group._id && (
                <div className="mt-4 space-y-4">
                  <Select
                    isMulti
                    options={subjects}
                    value={selectedSubjects}
                    onChange={setSelectedSubjects}
                    className="mt-1"
                    placeholder="Select subjects..."
                  />
                  <button
                    onClick={() => handleUpdateSubjects(group._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Update Subjects
                  </button>
                </div>
              )}
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Assigned Subjects:</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {group.subjects?.map(subject => (
                    <li key={subject._id}>
                      {subject.name} ({subject.lecturesPerWeek || 3} lectures/week)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageStudentGroups;
