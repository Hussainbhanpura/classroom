import express from 'express';
import StudentGroup from '../models/studentGroupSchema.js';
import Subject from '../models/subjectSchema.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

// Get all student groups
router.get('/student-groups', async (req, res) => {
  try {
    console.log('Fetching student groups...');
    console.log('User:', req.user);
    
    const groups = await StudentGroup.find()
      .populate('subjects', 'name lecturesPerWeek')
      .sort('name')
      .lean();
    
    console.log(`Successfully fetched ${groups.length} student groups`);
    const formattedGroups = groups.map(group => {
      if (group.subjects && group.subjects.length > 0) {
        return {
          ...group,
          subjects: group.subjects.map(subject => subject.name)
        };
      } else {
        return group;
      }
    });
    res.json(formattedGroups);
  } catch (error) {
    console.error('Error fetching student groups:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch student groups',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add a new student group (admin only)
router.post('/student-groups', isAdmin, async (req, res) => {
  try {
    const { name, academicYear, subjects } = req.body;

    // Validate required fields
    if (!name || !academicYear) {
      return res.status(400).json({ 
        message: 'Name and academic year are required' 
      });
    }

    // Validate subjects if provided
    if (subjects && subjects.length > 0) {
      const validSubjects = await Subject.find({ _id: { $in: subjects } });
      if (validSubjects.length !== subjects.length) {
        return res.status(400).json({ message: 'One or more invalid subject IDs provided' });
      }
    }

    // Create new student group
    const group = new StudentGroup({
      name,
      academicYear,
      subjects: subjects || [],
      isActive: true
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating student group:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'A student group with this name already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create student group' });
    }
  }
});

// Update a student group (admin only)
router.put('/student-groups/:id', isAdmin, async (req, res) => {
  try {
    const { name, academicYear, isActive } = req.body;
    const group = await StudentGroup.findByIdAndUpdate(
      req.params.id,
      { name, academicYear, isActive },
      { new: true }
    );
    
    if (!group) {
      return res.status(404).json({ message: 'Student group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error updating student group:', error);
    res.status(500).json({ message: 'Failed to update student group' });
  }
});

// Update student group subjects
router.put('/student-groups/:id/subjects', isAdmin, async (req, res) => {
  try {
    const { subjects } = req.body;

    // Validate subjects
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of subject IDs' });
    }

    // Verify all subjects exist
    const validSubjects = await Subject.find({ _id: { $in: subjects } });
    if (validSubjects.length !== subjects.length) {
      return res.status(400).json({ message: 'One or more invalid subject IDs provided' });
    }

    // Update student group
    const group = await StudentGroup.findByIdAndUpdate(
      req.params.id,
      { $set: { subjects } },
      { new: true }
    ).populate('subjects', 'name lecturesPerWeek');

    if (!group) {
      return res.status(404).json({ message: 'Student group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error updating student group subjects:', error);
    res.status(500).json({ message: 'Failed to update student group subjects' });
  }
});

// Get student group by ID
router.get('/student-groups/:id', async (req, res) => {
  try {
    const group = await StudentGroup.findById(req.params.id)
      .populate('subjects', 'name lecturesPerWeek')
      .lean();

    if (!group) {
      return res.status(404).json({ message: 'Student group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching student group:', error);
    res.status(500).json({ message: 'Failed to fetch student group' });
  }
});

// Delete a student group (admin only)
router.delete('/student-groups/:id', isAdmin, async (req, res) => {
  try {
    const group = await StudentGroup.findByIdAndDelete(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Student group not found' });
    }
    
    res.json({ message: 'Student group deleted successfully' });
  } catch (error) {
    console.error('Error deleting student group:', error);
    res.status(500).json({ message: 'Failed to delete student group' });
  }
});

export default router;
