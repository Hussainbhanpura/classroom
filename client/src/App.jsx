import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Admin Pages
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudentGroups from './pages/admin/ManageStudentGroups';
import ManageSubjects from './pages/admin/ManageSubjects';
import GenerateTimetable from './pages/admin/GenerateTimetable';
import ManageTimetable from './pages/admin/ManageTimetable';

// Teacher Pages
import TeacherPreferences from './pages/teacher/TeacherPreferences';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';

// Auth Pages
import Login from './pages/Login';


// Components
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router>
        <div className="min-h-screen bg-gray-50">
        <Routes>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />


          {/* Admin Routes */}
          <Route
            path="/admin/teachers"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageTeachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/student-groups"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageStudentGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageSubjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/generate-timetable"
            element={
              <ProtectedRoute requiredRole="admin">
                <GenerateTimetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/timetable"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageTimetable />
              </ProtectedRoute>
            }
          />

            {/* Teacher Routes */}
            <Route
            path="/teacher/preferences"
            element={
              <ProtectedRoute requiredRole="teacher">
              <TeacherPreferences />
              </ProtectedRoute>
            }
            />

            {/* Student Routes */}
            <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
              <StudentDashboard />
              </ProtectedRoute>
            }
            />
            <Route
            path="/student/profile"
            element={
              <ProtectedRoute requiredRole="student">
              <StudentProfile />
              </ProtectedRoute>
            }
            />

            {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        <Toaster 
          position="bottom-right"
          toastOptions={{
          duration: 3000
          }}
        />

      </div>
    </Router>
  );
}

export default App;
