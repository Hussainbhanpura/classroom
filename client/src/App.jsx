import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Admin Pages
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudentGroups from './pages/admin/ManageStudentGroups';
import ManageSubjects from './pages/admin/ManageSubjects';
import GenerateTimetable from './pages/admin/GenerateTimetable';
import ManageTimetable from './pages/admin/ManageTimetable';

// Teacher Pages
import TeacherPreferences from './pages/teacher/TeacherPreferences';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
