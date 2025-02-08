import express from 'express';
import { authenticateUser } from '../../middleware/auth.js';
import User from '../../models/userSchema.js';

const router = express.Router();

// General profile route
router.get('/', authenticateUser, async (req, res) => {
	try {
		const user = await User.findOne({
			_id: req.user._id,
			isDeactivated: false
		})
		.select('-password')
		.populate('metadata.studentGroup')
		.populate('metadata.subjects');

		if (!user) {
			return res.status(404).json({ message: 'Profile not found' });
		}

		res.json(user);
	} catch (error) {
		console.error('Error fetching profile:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// Student-specific profile route
router.get('/student', authenticateUser, async (req, res) => {
	try {
		const student = await User.findOne({
			_id: req.user._id,
			role: 'student',
			isDeactivated: false
		})
		.select('-password')
		.populate('metadata.studentGroup');

		if (!student) {
			return res.status(404).json({ message: 'Student profile not found' });
		}

		res.json(student);
	} catch (error) {
		console.error('Error fetching student profile:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

export default router;
