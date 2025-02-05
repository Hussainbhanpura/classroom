import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

export const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No auth token found' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Add user info to request
    req.user = decoded;
    req.user._id = decoded.id; // Ensure both id and _id are available
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
