import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn, getUserRole } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole }) => {
	const isAuthenticated = isLoggedIn();
	const userRole = getUserRole();
	
	console.log('Protected Route Check:', {
		isAuthenticated,
		userRole,
		requiredRole
	});

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (requiredRole && userRole !== requiredRole) {
		// Redirect based on user's role
		if (userRole === 'admin') {
			return <Navigate to="/admin/dashboard" replace />;
		} else if (userRole === 'teacher') {
			return <Navigate to="/teacher/dashboard" replace />;
		} else if (userRole === 'student') {
			return <Navigate to="/student/dashboard" replace />;
		}
		return <Navigate to="/login" replace />;
	}

	return children;
};

export default ProtectedRoute;