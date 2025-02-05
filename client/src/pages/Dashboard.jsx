import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [timetableData, setTimetableData] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token to get user role
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
      fetchTimetable(payload.role);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (userRole) {
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'teacher') {
        navigate('/teacher/dashboard');
      }
    }
  }, [userRole, navigate]);

  const fetchTimetable = async (role) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = role === 'admin' 
        ? '/api/admin/timetables'
        : role === 'teacher'
          ? '/api/teachers/timetable'
          : '/api/students/timetable';

      const response = await axios.get('http://localhost:3001' + endpoint, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setTimetableData(response.data);
    } catch (error) {
      toast.error('Failed to fetch timetable');
    }
  };

  const generateTimetable = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/admin/timetables/generate', {}, {
        headers: { Authorization: 'Bearer ' + token }
      });
      toast.success('Timetable generated successfully!');
      fetchTimetable('admin');
    } catch (error) {
      toast.error('Failed to generate timetable');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Timetable Dashboard</h1>
        {userRole === 'admin' && (
          <Button onClick={generateTimetable}>
            Generate Timetable
          </Button>
        )}
      </div>

      <Tabs defaultValue="timetable">
        <TabsList>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          {userRole === 'admin' && (
            <>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="timetable">
          <div className="grid gap-4">
            {days.map(day => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {timetableData
                      .filter(slot => slot.day === day)
                      .map((slot, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg bg-white shadow-sm"
                        >
                          <p className="font-medium">{slot.subject}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(slot.startTime).toLocaleTimeString()} - 
                            {new Date(slot.endTime).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-gray-600">Room: {slot.classroom}</p>
                          <p className="text-sm text-gray-600">Teacher: {slot.teacher}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {userRole === 'admin' && (
          <>
            <TabsContent value="teachers">
              <Card>
                <CardHeader>
                  <CardTitle>Teacher Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Teacher management content */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classrooms">
              <Card>
                <CardHeader>
                  <CardTitle>Classroom Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Classroom management content */}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;
