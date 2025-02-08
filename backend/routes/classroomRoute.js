import express from 'express';
import Classroom, { TIME_SLOTS, DAYS_OF_WEEK } from '../models/classroomSchema.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get time slots and days
router.get('/classrooms/schedule-config', async (req, res) => {
  try {
    res.json({
      timeSlots: TIME_SLOTS,
      daysOfWeek: DAYS_OF_WEEK
    });
  } catch (error) {
    console.error('Error fetching schedule config:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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
    const { name, capacity, equipment, isActive } = req.body;
    
    // Create new classroom with default availability
    const classroom = new Classroom({ 
      name, 
      capacity, 
      equipment,
      isActive
    });

    await classroom.save();
    res.status(201).json(classroom);
  } catch (error) {
    console.error('Error creating classroom:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A classroom with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update classroom (admin only)
router.put('/classrooms/:id', isAdmin, async (req, res) => {
  try {
    const { name, capacity, equipment, isActive, availability } = req.body;
    
    // Validate availability structure if provided
    if (availability) {
      for (const day of DAYS_OF_WEEK) {
        if (!availability[day]) {
          return res.status(400).json({ message: `Missing availability for ${day}` });
        }
        for (const slot of TIME_SLOTS) {
          if (typeof availability[day][slot] !== 'boolean') {
            return res.status(400).json({ message: `Invalid availability value for ${day} ${slot}` });
          }
        }
      }
    }

    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        capacity, 
        equipment, 
        isActive,
        ...(availability && { availability })
      },
      { new: true }
    );

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.json(classroom);
  } catch (error) {
    console.error('Error updating classroom:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A classroom with this name already exists' });
    }
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
