import express from 'express';
import Timetable from '../models/timetableSchema.js';
import { auth, isAdmin } from '../middleware/auth.js';
import TimetableGenerator from '../services/timetableGenerator.js';
import User from '../models/userSchema.js';
import mongoose from 'mongoose';
import Classroom from '../models/classroomSchema.js';
import { TimetableSlot } from '../models/timetableSlotSchema.js';
import StudentGroup from '../models/studentGroupSchema.js';

const router = express.Router();

router.use(auth);

// Get current timetable
router.get('/timetable', async (req, res) => {
  try {
    // Get all student groups with their timetable slots populated
    const studentGroups = await StudentGroup.find()
      .populate({
        path: 'timetable',
        populate: [
          { path: 'teacherId', select: 'name' },
          { path: 'subjectId', select: 'name' },
          { path: 'classroomId', select: 'name' }
        ]
      })
      .lean();

    if (!studentGroups || studentGroups.length === 0) {
      return res.status(404).json({ message: 'No student groups found' });
    }

    // Transform the data into the required format
    const timetable = studentGroups.map(group => ({
      studentGroup: group.name,
      schedule: group.timetable.map(slot => ({
        day: slot.dayName,
        timeSlot: slot.timeSlotName,
        teacher: slot.teacherId,
        subject: slot.subjectId,
        classroom: slot.classroomId
      })).sort((a, b) => {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.timeSlot.localeCompare(b.timeSlot);
      })
    }));

    // Get the active timetable for metadata
    const activeTimetable = await Timetable.findOne({ status: 'active' })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      timetableId: activeTimetable?._id,
      academicYear: activeTimetable?.academicYear,
      semester: activeTimetable?.semester,
      timetable
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
    
    // Find all timetable slots where this teacher is assigned
    const slots = await TimetableSlot.find({ teacherId })
      .populate('subjectId', 'name')
      .populate('classroomId', 'name')
      .populate('studentGroupId', 'name')
      .sort({ dayName: 1, timeSlotName: 1 })
      .lean();

    const formattedSchedule = slots.map(slot => ({
      day: slot.dayName,
      timeSlot: slot.timeSlotName,
      subject: slot.subjectId.name,
      room: slot.classroomId.name,
      studentGroup: slot.studentGroupId.name
    }));

    res.json(formattedSchedule);
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({ message: 'Failed to fetch schedule' });
  }
});

// Get student's schedule
router.get('/student/schedule', auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student's group with populated timetable
    const student = await User.findById(studentId)
      .populate('metadata.studentGroup')
      .lean();

    if (!student?.metadata?.studentGroup) {
      return res.status(400).json({ message: 'Student not assigned to any group' });
    }

    // Get the student group's timetable
    const studentGroup = await StudentGroup.findById(student.metadata.studentGroup._id)
      .populate({
        path: 'timetable',
        populate: [
          { path: 'teacherId', select: 'name' },
          { path: 'subjectId', select: 'name' },
          { path: 'classroomId', select: 'name' }
        ]
      })
      .lean();

    const schedule = studentGroup.timetable.map(slot => ({
      day: slot.dayName,
      timeSlot: slot.timeSlotName,
      subject: slot.subjectId.name,
      teacher: slot.teacherId.name,
      room: slot.classroomId.name
    })).sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    res.json({
      studentGroup: student.metadata.studentGroup.name,
      schedule
    });
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    res.status(500).json({ message: 'Failed to fetch schedule' });
  }
});

// Get timetable by student group ID
router.get('/timetable/group/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Validate groupId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid student group ID format' });
    }

    // Get student group with populated timetable
    const studentGroup = await StudentGroup.findById(groupId)
        .populate({
        path: 'timetable',
        populate: [
          { path: 'teacherId', select: 'name' },
          { path: 'subjectId', select: 'name' },
          { path: 'classroomId', select: 'name' }
        ]
        })
      .lean();
      console.log(studentGroup);
      

    if (!studentGroup) {
      return res.status(404).json({ message: 'Student group not found' });
    }

    if (!studentGroup.timetable || studentGroup.timetable.length === 0) {
      return res.json({
        studentGroup: studentGroup.name,
        schedule: []
      });
    }

    // Transform the timetable data
    const schedule = studentGroup.timetable.map(slot => ({
      day: slot.dayName,
      timeSlot: slot.timeSlotName,
      teacher: slot.teacherId,
      subject: slot.subjectId,
      classroom: slot.classroomId
    })).sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    res.json({
      studentGroup: studentGroup.name,
      schedule
    });
  } catch (error) {
    console.error('Error fetching group timetable:', error);
    res.status(500).json({ 
      message: 'Failed to fetch timetable',
      error: error.message 
    });
  }
});

// Generate new timetable (admin only)
router.post('/generate-timetable', isAdmin, async (req, res) => {
  try {
    console.log('Starting timetable generation...');
    
    req.setTimeout(900000);
    res.setTimeout(900000);
    
    await Timetable.deleteMany({});
    await TimetableSlot.deleteMany({});

    const teachers = await User.find({ role: 'teacher' }).populate('metadata.subjects');
    const classrooms = await Classroom.find();
    const studentGroups = await StudentGroup.find();

    if (!teachers.length) {
      return res.status(400).json({ message: 'No teachers found for timetable generation' });
    }
    if (!classrooms.length) {
      return res.status(400).json({ message: 'No classrooms found for timetable generation' });
    }

    const newTimetable = await Timetable.create({
      academicYear: new Date().getFullYear(),
      semester: 1,
      createdAt: new Date(),
      status: 'active'
    });

    const generator = new TimetableGenerator(newTimetable._id);
    generator.teachers = teachers;
    generator.classrooms = classrooms;

    const timetableSlots = await generator.generateTimetable();

    if (!timetableSlots || timetableSlots.length === 0) {
      await Timetable.deleteOne({ _id: newTimetable._id });
      return res.status(400).json({
        message: 'Failed to generate timetable. Please check teacher preferences and subject assignments.'
      });
    }

    // Group slots by student group and update each student group's timetable
    const slotsByGroup = {};
    timetableSlots.forEach(slot => {
      const groupId = slot.studentGroupId.toString();
      if (!slotsByGroup[groupId]) {
        slotsByGroup[groupId] = [];
      }
      slotsByGroup[groupId].push(slot._id);
    });

    // Update each student group's timetable array
    for (const [groupId, slots] of Object.entries(slotsByGroup)) {
      await StudentGroup.findByIdAndUpdate(groupId, {
        $set: { timetable: slots }
      });
    }

    // Update timetable with slot references
    newTimetable.slots = timetableSlots.map(slot => slot._id);
    await newTimetable.save();

    // Get all created slots with populated data
    const createdSlots = await TimetableSlot.find()
      .populate('teacherId', 'name')
      .populate('subjectId', 'name')
      .populate('classroomId', 'name')
      .populate('studentGroupId', 'name')
      .sort({ dayName: 1, timeSlotName: 1 })
      .lean();

    // Group and format slots for response
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
        teacher: slot.teacherId,
        subject: slot.subjectId,
        classroom: slot.classroomId
      });
    });

    // Sort schedules
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
