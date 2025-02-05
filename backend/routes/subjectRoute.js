import express from 'express';
import Subject from '../models/subjectSchema.js';
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
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new subject (admin only)
router.post('/subjects', isAdmin, async (req, res) => {
  try {
    console.log('POST /subjects - User:', req.user);
    console.log('Creating subject with body:', req.body);
    
    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const { name, code, description, department, credits, requiredEquipment } = req.body;

    // Check if subject with same name already exists
    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject with this name already exists' });
    }

    const subject = new Subject({
      name,
      code: code || '',
      description: description || '',
      department: department || '',
      credits: credits || 0,
      requiredEquipment: requiredEquipment || [],
      isActive: true
    });

    console.log('Saving subject:', subject.toObject());
    const savedSubject = await subject.save();
    console.log('Subject saved successfully:', savedSubject.toObject());

    res.status(201).json(savedSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject with this name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
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
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
