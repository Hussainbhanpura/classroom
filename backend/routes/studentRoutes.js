import express from 'express';
import { auth, isStudent } from '../middleware/auth.js';
import User from '../models/userSchema.js';

const router = express.Router();

// Get student profile
router.get('/profile', auth, isStudent, async (req, res) => {
	try {
		console.log('User ID from token:', req.user._id); // Debug log
		console.log('Full user object from token:', req.user); // Additional debug log

		const studentId = req.user._id;
		const student = await User.findById(studentId)
		.select('-password')
		.populate('metadata.studentGroup');

		console.log('Raw student data:', student); // Debug log

		if (!student) {
			console.log('Student not found for ID:', studentId); // Debug log
			return res.status(404).json({ message: 'Student not found' });
		}

		if (student.isDeactivated) {
			console.log('Student account is deactivated:', studentId); // Debug log
			return res.status(403).json({ message: 'Account is deactivated' });
		}

		if (student.role !== 'student') {
			console.log('Invalid role for user:', student.role); // Debug log
			return res.status(403).json({ message: 'Invalid user role' });
		}

		console.log('Found student:', student); // Debug log

		const profileData = {
			id: student._id,
			name: student.name,
			email: student.email,
			year: student.metadata.year,
			section: student.metadata.section,
			studentGroup: student.metadata.studentGroup,
			createdAt: student.createdAt
		};

		res.json(profileData);
	} catch (error) {
		console.error('Profile route error:', error); // Debug log
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Update student profile
router.put('/profile', auth, isStudent, async (req, res) => {
	try {
		const { name, email, year, section } = req.body;
		const studentId = req.user._id;

		// Find and update student
		const student = await User.findById(studentId);

		if (!student || student.role !== 'student') {
			return res.status(404).json({ message: 'Student not found' });
		}

		// Update fields
		student.name = name || student.name;
		student.email = email || student.email;
		student.metadata.year = year || student.metadata.year;
		student.metadata.section = section || student.metadata.section;

		await student.save();

		// Return updated profile without password
		const updatedProfile = await User.findById(studentId)
			.select('-password')
			.populate('metadata.studentGroup');

		res.json({
			id: updatedProfile._id,
			name: updatedProfile.name,
			email: updatedProfile.email,
			year: updatedProfile.metadata.year,
			section: updatedProfile.metadata.section,
			studentGroup: updatedProfile.metadata.studentGroup,
			createdAt: updatedProfile.createdAt
		});
	} catch (error) {
		console.error('Profile update error:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

// Change password route  
router.put('/change-password', auth, isStudent, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const student = await User.findById(req.user._id);

		if (!student || student.role !== 'student') {
			return res.status(404).json({ message: 'Student not found' });
		}

		// Verify current password
		const isMatch = await student.comparePassword(currentPassword);
		if (!isMatch) {
			return res.status(400).json({ message: 'Current password is incorrect' });
		}

		// Update password
		student.password = newPassword;
		await student.save(); // This will trigger the password hashing middleware

		res.json({ message: 'Password updated successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
});

export default router;