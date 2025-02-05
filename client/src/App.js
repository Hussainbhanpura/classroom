import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudents from './pages/admin/ManageStudents';
import ManageClassrooms from './pages/admin/ManageClassrooms';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageTimetable from './pages/admin/ManageTimetable';
import TeacherSchedule from './pages/teacher/TeacherSchedule';
import TeacherPreferences from './pages/teacher/TeacherPreferences';
import ViewTimetable from './pages/teacher/ViewTimetable';
import { isLoggedIn, getUserRole } from './utils/auth';

// Protected Route Component with role check
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const authenticated = isLoggedIn();
  const userRole = getUserRole();
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classrooms"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageClassrooms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageSubjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/timetable"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageTimetable />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/schedule"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/preferences"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherPreferences />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/view-timetable"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ViewTimetable />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
              {getUserRole() === 'admin' && <Navigate to="/admin/dashboard" replace />}
              {getUserRole() === 'teacher' && <Navigate to="/teacher/dashboard" replace />}
              {getUserRole() === 'student' && <Navigate to="/student/dashboard" replace />}
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
