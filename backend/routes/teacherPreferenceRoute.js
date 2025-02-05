import express from 'express';
import TeacherPreference from '../models/teacherPreferenceSchema.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

// Preference value mappings
const PREFERRED = 1;
const AVAILABLE = 0;
const UNAVAILABLE = -1;

// Days array with proper capitalization
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

// Convert numeric value to string
function numericToString(value) {
  switch (value) {
    case PREFERRED: return 'preferred';
    case UNAVAILABLE: return 'not-available';
    default: return 'available';
  }
}

// Convert string to numeric value
function stringToNumeric(value) {
  switch (value) {
    case 'preferred': return PREFERRED;
    case 'not-available': return UNAVAILABLE;
    default: return AVAILABLE;
  }
}

// Get teacher's preferences
router.get('/preferences', async (req, res) => {
  try {
    const preferences = await TeacherPreference.findOne({ teacherId: req.user._id })
      .populate('teacherId', 'name email')
      .lean();

    if (!preferences) {
      // Return default preferences if none exist
      const defaultPreferences = {};
      DAYS.forEach(day => {
        defaultPreferences[day] = {};
        TIME_SLOTS.forEach(slot => {
          defaultPreferences[day][slot] = 'available';
        });
      });
      return res.json({ 
        availableTimeSlots: defaultPreferences,
        maxSlotsPerDay: 6,
        maxSlotsPerWeek: 25
      });
    }

    // Convert numeric preferences to strings
    const formattedPreferences = {};
    DAYS.forEach(day => {
      formattedPreferences[day] = {};
      TIME_SLOTS.forEach(slot => {
        const value = preferences.availableTimeSlots?.[day.toLowerCase()]?.[slot] ?? AVAILABLE;
        formattedPreferences[day][slot] = numericToString(value);
      });
    });

    res.json({ 
      availableTimeSlots: formattedPreferences,
      maxSlotsPerDay: preferences.maxSlotsPerDay,
      maxSlotsPerWeek: preferences.maxSlotsPerWeek
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Failed to fetch preferences' });
  }
});

// Save teacher's preferences
router.post('/preferences', async (req, res) => {
  try {
    const { availableTimeSlots, maxSlotsPerDay, maxSlotsPerWeek } = req.body;
    
    // Validate maxSlots
    if (!maxSlotsPerDay || maxSlotsPerDay < 1 || maxSlotsPerDay > 8) {
      return res.status(400).json({
        message: 'Maximum slots per day must be between 1 and 8'
      });
    }

    if (!maxSlotsPerWeek || maxSlotsPerWeek < maxSlotsPerDay || maxSlotsPerWeek > 40) {
      return res.status(400).json({
        message: 'Maximum slots per week must be at least equal to daily maximum and less than or equal to 40'
      });
    }

    // Convert string preferences to numeric values
    const numericPreferences = {};
    Object.entries(availableTimeSlots).forEach(([day, slots]) => {
      numericPreferences[day.toLowerCase()] = {};
      Object.entries(slots).forEach(([slot, value]) => {
        numericPreferences[day.toLowerCase()][slot] = stringToNumeric(value);
      });
    });

    // Update or create preferences
    await TeacherPreference.findOneAndUpdate(
      { teacherId: req.user._id },
      { 
        teacherId: req.user._id,
        availableTimeSlots: numericPreferences,
        maxSlotsPerDay,
        maxSlotsPerWeek
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ message: 'Failed to save preferences' });
  }
});

// Update teacher preferences
router.put('/teacher-preferences/:id', isAdmin, async (req, res) => {
  try {
    const { availableTimeSlots, maxSlotsPerDay, maxSlotsPerWeek } = req.body;

    // Validate maxSlots
    if (!maxSlotsPerDay || maxSlotsPerDay < 1 || maxSlotsPerDay > 8) {
      return res.status(400).json({
        message: 'Maximum slots per day must be between 1 and 8'
      });
    }

    if (!maxSlotsPerWeek || maxSlotsPerWeek < maxSlotsPerDay || maxSlotsPerWeek > 40) {
      return res.status(400).json({
        message: 'Maximum slots per week must be at least equal to daily maximum and less than or equal to 40'
      });
    }

    const preference = await TeacherPreference.findByIdAndUpdate(
      req.params.id,
      { 
        availableTimeSlots,
        maxSlotsPerDay,
        maxSlotsPerWeek
      },
      { new: true }
    );

    if (!preference) {
      return res.status(404).json({ message: 'Teacher preference not found' });
    }

    res.json(preference);
  } catch (error) {
    console.error('Error updating teacher preference:', error);
    res.status(500).json({ message: 'Failed to update teacher preference' });
  }
});

export default router;
