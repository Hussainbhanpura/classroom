import express from 'express';
import Classroom from '../models/classroomSchema.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all classrooms
router.get('/classrooms', async (req, res) => {
  try {
    const classrooms = await Classroom.find().sort('name');
    res.json(classrooms);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new classroom (admin only)
router.post('/classrooms', isAdmin, async (req, res) => {
  try {
    const { name, capacity, equipment } = req.body;
    const classroom = new Classroom({ name, capacity, equipment });
    await classroom.save();
    res.status(201).json(classroom);
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update classroom (admin only)
router.put('/classrooms/:id', isAdmin, async (req, res) => {
  try {
    const { name, capacity, equipment } = req.body;
    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { name, capacity, equipment },
      { new: true }
    );
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.json(classroom);
  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete classroom (admin only)
router.delete('/classrooms/:id', isAdmin, async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
