import express from 'express';
import Timetable from '../models/timetableSchema.js';
import { auth, isAdmin } from '../middleware/auth.js';
import TimetableGenerator from '../services/timetableGenerator.js';
import User from '../models/userSchema.js';
import mongoose from 'mongoose';
import Classroom from '../models/classroomSchema.js';
import { TimetableSlot } from '../models/timetableSlotSchema.js';

const router = express.Router();

router.use(auth);

// Get current timetable
router.get('/timetable', async (req, res) => {
  try {
    // Get the active timetable
    const activeTimetable = await Timetable.findOne({ status: 'active' })
      .sort({ createdAt: -1 })
      .lean();

    if (!activeTimetable) {
      return res.status(404).json({ message: 'No active timetable found' });
    }

    // Get all slots for this timetable
    const slots = await TimetableSlot.find({ timetableId: activeTimetable._id })
      .populate('teacherId', 'name')
      .populate('subjectId', 'name')
      .populate('classroomId', 'name')
      .populate('studentGroupId', 'name')
      .sort({ dayName: 1, timeSlotName: 1 })
      .lean();

    // Group slots by student group
    const groupedSlots = {};

    slots.forEach(slot => {
      const studentGroupId = slot.studentGroupId._id.toString();
      if (!groupedSlots[studentGroupId]) {
        groupedSlots[studentGroupId] = {
          studentGroup: slot.studentGroupId.name,
          schedule: []
        };
      }

      groupedSlots[studentGroupId].schedule.push({
        day: slot.dayName,
        timeSlot: slot.timeSlotName,
        teacher: slot.teacherId.name,
        subject: slot.subjectId.name,
        classroom: slot.classroomId.name
      });
    });

    // Sort schedule for each group
    Object.values(groupedSlots).forEach(group => {
      group.schedule.sort((a, b) => {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.timeSlot.localeCompare(b.timeSlot);
      });
    });

    res.json({
      timetableId: activeTimetable._id,
      academicYear: activeTimetable.academicYear,
      semester: activeTimetable.semester,
      timetable: Object.values(groupedSlots)
    });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Failed to fetch timetable' });
  }
});

// Get teacher's schedule
router.get('/teacher/schedule', auth, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const timetable = await Timetable.find({ teacherId })
      .populate('subjectId', 'name')
      .populate('classroomId', 'name')
      .sort({ day: 1, timeSlot: 1 })
      .lean();

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];

    const formattedTimetable = timetable.map(slot => ({
      day: days[slot.day],
      timeSlot: timeSlots[slot.timeSlot],
      subject: slot.subjectId.name,
      room: slot.classroomId.name
    }));

    res.json(formattedTimetable);
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({ message: 'Failed to fetch schedule' });
  }
});

// Get student's schedule
router.get('/student/schedule', auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student's group
    const student = await User.findById(studentId).populate('metadata.studentGroup');
    if (!student?.metadata?.studentGroup) {
      return res.status(400).json({ message: 'Student not assigned to any group' });
    }

    const studentGroupId = student.metadata.studentGroup._id;

    const timetable = await Timetable.find({ studentGroupId })
      .populate('teacherId', 'name')
      .populate('subjectId', 'name')
      .populate('classroomId', 'name')
      .sort({ day: 1, timeSlot: 1 })
      .lean();

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];

    const formattedTimetable = timetable.map(slot => ({
      day: days[slot.day],
      timeSlot: timeSlots[slot.timeSlot],
      subject: slot.subjectId.name,
      teacher: slot.teacherId.name,
      room: slot.classroomId.name
    }));

    res.json({
      studentGroup: student.metadata.studentGroup.name,
      schedule: formattedTimetable
    });
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    res.status(500).json({ message: 'Failed to fetch schedule' });
  }
});

// Generate new timetable (admin only)
router.post('/generate-timetable', isAdmin, async (req, res) => {
  try {
    console.log('Starting timetable generation...');
    
    // Set timeout to 15 minutes
    req.setTimeout(900000);
    res.setTimeout(900000);
    
    // Clear existing timetable and slots
    await Timetable.deleteMany({});
    await TimetableSlot.deleteMany({});

    // Get all required data
    const teachers = await User.find({ role: 'teacher' }).populate('metadata.subjects');
    const classrooms = await Classroom.find();

    if (!teachers.length) {
      return res.status(400).json({ message: 'No teachers found for timetable generation' });
    }
    if (!classrooms.length) {
      return res.status(400).json({ message: 'No classrooms found for timetable generation' });
    }

    // Create a new Timetable document
    const newTimetable = await Timetable.create({
      academicYear: new Date().getFullYear(),
      semester: 1,
      createdAt: new Date(),
      status: 'active'
    });

    // Initialize generator with required data
    const generator = new TimetableGenerator(newTimetable._id);
    generator.teachers = teachers;
    generator.classrooms = classrooms;

    // Generate new timetable
    const timetableSlots = await generator.generateTimetable();

    if (!timetableSlots || timetableSlots.length === 0) {
      await Timetable.deleteOne({ _id: newTimetable._id }); // Clean up if generation failed
      return res.status(400).json({
        message: 'Failed to generate timetable. Please check teacher preferences and subject assignments.'
      });
    }

    // Update timetable with slot references
    newTimetable.slots = timetableSlots.map(slot => slot._id);
    await newTimetable.save();

    // Get all created slots
    const createdSlots = await TimetableSlot.find()
      .populate('teacherId', 'name')
      .populate('subjectId', 'name')
      .populate('classroomId', 'name')
      .populate('studentGroupId', 'name')
      .sort({ dayName: 1, timeSlotName: 1 })
      .lean();

    // Group slots by student group
    const groupedSlots = {};

    createdSlots.forEach(slot => {
      const studentGroupId = slot.studentGroupId._id.toString();
      if (!groupedSlots[studentGroupId]) {
        groupedSlots[studentGroupId] = {
          studentGroup: slot.studentGroupId.name,
          schedule: []
        };
      }

      groupedSlots[studentGroupId].schedule.push({
        day: slot.dayName,
        timeSlot: slot.timeSlotName,
        teacher: slot.teacherId.name,
        subject: slot.subjectId.name,
        classroom: slot.classroomId.name
      });
    });

    // Sort schedule for each group by day and time
    Object.values(groupedSlots).forEach(group => {
      group.schedule.sort((a, b) => {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.timeSlot.localeCompare(b.timeSlot);
      });
    });

    res.json({
      message: 'Timetable generated successfully',
      timetableId: newTimetable._id,
      timetable: Object.values(groupedSlots)
    });
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({
      message: 'Failed to generate timetable',
      error: error.message
    });
  }
});

export default router;
