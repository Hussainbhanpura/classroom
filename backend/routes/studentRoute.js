import express from 'express';
import { auth, isStudent } from '../middleware/auth.js';
import User from '../models/userSchema.js';

const router = express.Router();

// Get student profile
router.get('/profile', auth, isStudent, async (req, res) => {
	try {
		console.log('Fetching student profile for user:', req.user.id);
		const student = await User.findById(req.user.id)
			.populate('metadata.studentGroup')
			.select('-password')
			.lean();

		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		console.log('Student profile found:', student);
		res.json(student);
	} catch (error) {
		console.error('Error fetching student profile:', error);
		res.status(500).json({ message: 'Failed to fetch profile' });
	}
});

export default router;