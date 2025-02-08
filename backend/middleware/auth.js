import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

export const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth middleware - Authorization header:', authHeader);
    const token = authHeader?.replace('Bearer ', '');
    console.log('Auth middleware - Token after Bearer removal:', token);
    
    if (!token) {
      return res.status(401).json({ message: 'No auth token found' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware - Decoded token:', decoded);
      
      // Find user by either _id or id
      const user = await User.findById(decoded._id || decoded.id);
      console.log('Auth middleware - Found user:', !!user);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Add user info to request
      req.user = {
        ...decoded,
        _id: decoded._id || decoded.id,  // Ensure _id is available
        id: decoded._id || decoded.id     // Ensure id is available
      };
      next();
    } catch (jwtError) {
      console.error('Auth middleware - JWT Error:', jwtError.name, jwtError.message);
      // Handle specific JWT errors
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware - Error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    console.log('isAdmin middleware - User:', req.user);
    
    // Check if user object exists
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ message: 'Authorization check failed' });
  }
};

// Middleware to check if user is a teacher
export const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teacher only.' });
  }
  next();
};

// Middleware to check if user is admin or teacher
export const isAdminOrTeacher = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Admin or teacher only.' });
  }
  next();
};

// Middleware to check if user is a student
export const isStudent = (req, res, next) => {
  console.log('isStudent middleware - User role:', req.user.role);
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student only.' });
  }
  next();
};
