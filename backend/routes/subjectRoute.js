import express from 'express';
import Subject from '../models/subjectSchema.js';
import StudentGroup from '../models/studentGroupSchema.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Log middleware to debug requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  if (req.body) console.log('Body:', req.body);
  next();
});

// Apply auth middleware to all routes
router.use(auth);

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    console.log('GET /subjects - User:', req.user);
    const { studentGroup } = req.query;
    
    let query = {};
    if (studentGroup) {
      query.studentGroup = studentGroup;
    }
    
    const subjects = await Subject.find(query)
      .populate('studentGroup', 'name academicYear');
    
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new subject (admin only)
router.post('/subjects', isAdmin, async (req, res) => {
  try {
    console.log('POST /subjects - Request body:', JSON.stringify(req.body, null, 2));
    
    if (!req.body.name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const { name, description, requiredEquipment, studentGroup, credits } = req.body;
    console.log(credits)
    // First check if the student group exists
    if (studentGroup) {
      const groupExists = await StudentGroup.findById(studentGroup);
      if (!groupExists) {
        return res.status(400).json({ message: 'Student group not found' });
      }
    }

    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject with this name already exists' });
    }

    // Create the subject with all required fields
    const subject = new Subject({
      name,
      description: description || '',
      requiredEquipment: requiredEquipment || [],
      studentGroup, // Add this field explicitly
      isActive: true,
      code: '',
      department: '',
      lecturesPerWeek: 3,
      credits : credits
    });

    console.log('Creating subject with data:', JSON.stringify(subject.toObject(), null, 2));
    const savedSubject = await subject.save();

    // Update the student group's subjects array
    if (studentGroup) {
      console.log('Updating student group:', studentGroup);
      const updatedGroup = await StudentGroup.findByIdAndUpdate(
        studentGroup,
        { $addToSet: { subjects: savedSubject._id } },
        { new: true }
      );
      console.log('Updated student group result:', updatedGroup ? 'Success' : 'Failed');
    }

    // Return the populated subject
    const populatedSubject = await Subject.findById(savedSubject._id)
      .populate('studentGroup', 'name academicYear');

    res.status(201).json(populatedSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.stack 
    });
  }
});


// Update subject (admin only)
router.put('/subjects/:id', isAdmin, async (req, res) => {
  try {
    console.log('PUT /subjects/:id - User:', req.user);
    console.log('Updating subject with body:', req.body);
    
    const { name, code, description, department, credits, requiredEquipment } = req.body;

    // Check if new name already exists (if name is being changed)
    if (name) {
      const existingSubject = await Subject.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      if (existingSubject) {
        return res.status(400).json({ message: 'Subject with this name already exists' });
      }
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code: code || '',
        description: description || '',
        department: department || '',
        credits: credits || 0,
        requiredEquipment: requiredEquipment || []
      },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    console.log('Subject updated successfully:', subject.toObject());
    res.json(subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject with this name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete subject (admin only)
router.delete('/subjects/:id', isAdmin, async (req, res) => {
  try {
    console.log('DELETE /subjects/:id - User:', req.user);
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Remove subject from student group if it's associated with one
    if (subject.studentGroup) {
      const StudentGroup = (await import('../models/studentGroupSchema.js')).default;
      await StudentGroup.findByIdAndUpdate(
        subject.studentGroup,
        { $pull: { subjects: subject._id } }
      );
    }

    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
