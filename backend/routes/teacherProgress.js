import express from 'express';
import User from '../models/userSchema.js';  
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get progress for all teachers
router.get('/teacher-progress', authenticateToken, async (req, res) => {
  try {
    // Get all teachers
    const teachers = await User.find({ role: 'teacher' }).select('name email');
    console.log('Found teachers:', teachers);

    const teacherProgress = teachers.map(teacher => ({
      name: teacher.name || teacher.email,  
      totalLectures: 48,  
      completedLectures: 0,
      progress: 0
    }));

    console.log('Teacher progress data:', teacherProgress);
    res.json(teacherProgress);
  } catch (error) {
    console.error('Error fetching teacher progress:', error);
    res.status(500).json({ message: 'Error fetching teacher progress', error: error.message });
  }
});

export default router;
