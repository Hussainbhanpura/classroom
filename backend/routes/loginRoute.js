import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';
import StudentGroup from '../models/studentGroupSchema.js';
import { mightContainEmail, addEmail } from '../utils/bloomFilter.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists in Bloom filter
    if (!mightContainEmail(email)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token with user info in payload
    const token = jwt.sign(
      {
        _id: user._id,
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send only the token
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, metadata } = req.body;

    // Check if email might exist
    if (mightContainEmail(email)) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role,
      metadata: {
        ...metadata,
        studentGroup: metadata?.studentGroup || null
      }
    });

    await user.save();
    addEmail(email);

    // If user is a student and has a student group, add them to the group
    if (role === 'student' && metadata?.studentGroup) {
      try {
        const group = await StudentGroup.findById(metadata.studentGroup);
        if (!group) {
          console.error('Student group not found:', metadata.studentGroup);
        } else {
          group.students.push(user._id);
          await group.save();
        }
      } catch (error) {
        console.error('Error adding student to group:', error);
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        _id: user._id,
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get the populated user data
    const populatedUser = await User.findById(user._id)
      .populate('metadata.studentGroup')
      .lean();

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        metadata: populatedUser.metadata
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all teachers
router.get('/users/teachers', auth, isAdmin, async (req, res) => {
  try {
    console.log('Fetching teachers. User:', req.user);
    
    const teachers = await User.find({ role: 'teacher' })
      .populate({
        path: 'metadata.subjects',
        model: 'Subject',
        select: 'name'
      })
      .populate({
        path: 'metadata.studentGroup',
        model: 'StudentGroup',
        select: 'name academicYear'
      })
      .lean()
      .exec();
    
    console.log(`Successfully fetched ${teachers.length} teachers`);
    
    // Transform the response to include only necessary data
    const transformedTeachers = teachers.map(teacher => ({
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      subjects: teacher.metadata?.subjects || [],
      studentGroup: teacher.metadata?.studentGroup ? {
        id: teacher.metadata.studentGroup._id,
        name: teacher.metadata.studentGroup.name,
        academicYear: teacher.metadata.studentGroup.academicYear
      } : null,
      createdAt: teacher.createdAt
    }));

    res.json(transformedTeachers);
  } catch (error) {
    console.error('Error in /users/teachers:', error);
    res.status(500).json({ 
      message: 'Failed to fetch teachers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all students
router.get('/users/students', isAdmin, async (req, res) => {
  try {
    console.log('Fetching all students...');
    
    const students = await User.find({ role: 'student' })
      .select('name email role metadata createdAt')
      .populate({
        path: 'metadata.studentGroup',
        model: 'StudentGroup',
        select: 'name academicYear'
      })
      .lean()
      .exec();

    console.log(`Successfully fetched ${students.length} students`);
    
    // Transform the response to include only necessary data
    const transformedStudents = students.map(student => ({
      id: student._id,
      name: student.name,
      email: student.email,
      group: student.metadata?.studentGroup ? {
        id: student.metadata.studentGroup._id,
        name: student.metadata.studentGroup.name,
        academicYear: student.metadata.studentGroup.academicYear
      } : null,
      createdAt: student.createdAt
    }));

    res.json(transformedStudents);
  } catch (error) {
    console.error('Error in /users/students:', error);
    // Send a more specific error message
    res.status(500).json({ 
      message: 'Failed to fetch students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete teacher
router.delete('/users/teacher/:id', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student
router.delete('/users/student/:id', isAdmin, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove student from their student group if they have one
    if (student.metadata?.studentGroup) {
      await StudentGroup.findByIdAndUpdate(
        student.metadata.studentGroup,
        { $pull: { students: student._id } }
      );
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.put('/users/student/:id', isAdmin, async (req, res) => {
  try {
    const { name, email, metadata } = req.body;
    const student = await User.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // If student group is being changed, handle the change
    if (metadata?.studentGroup !== student.metadata?.studentGroup?.toString()) {
      // Remove from old group if exists
      if (student.metadata?.studentGroup) {
        await StudentGroup.findByIdAndUpdate(
          student.metadata.studentGroup,
          { $pull: { students: student._id } }
        );
      }
      
      // Add to new group if specified
      if (metadata?.studentGroup) {
        await StudentGroup.findByIdAndUpdate(
          metadata.studentGroup,
          { $addToSet: { students: student._id } }
        );
      }
    }

    // Update student
    const updatedStudent = await User.findByIdAndUpdate(
      req.params.id,
      { 
        name,
        email,
        metadata: {
          ...student.metadata,
          ...metadata
        }
      },
      { new: true }
    )
    .populate({
      path: 'metadata.studentGroup',
      model: 'StudentGroup',
      select: 'name academicYear'
    })
    .lean();

    res.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;