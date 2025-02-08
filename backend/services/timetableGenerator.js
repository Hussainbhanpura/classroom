import TeacherPreference from '../models/teacherPreferenceSchema.js';
import User from '../models/userSchema.js';
import Classroom from '../models/classroomSchema.js';
import Subject from '../models/subjectSchema.js';
import StudentGroup from '../models/studentGroupSchema.js';
import { TimetableSlot } from '../models/timetableSlotSchema.js';
import mongoose from 'mongoose';

class TimetableGenerator {
  constructor(timetableId = null) {
    this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    this.timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];
    
    this.UNAVAILABLE = -1;
    this.AVAILABLE = 0;
    this.PREFERRED = 1;
    
    this.teachers = [];
    // For each teacher, we store daily data in teacherLimits as:
    // { daily: Map(day => { count, lastIndex }), weekly, maxDaily, maxWeekly }
    this.teacherLimits = new Map();
    this.classroomAvailability = new Map();
    this.timetableId = timetableId || new mongoose.Types.ObjectId();
  }

  // Helper to get teacher's preference for a given day/time slot.
  // Cache for teacher preferences
  teacherPrefCache = new Map();

  async getTeacherPreference(teacher, day, timeSlot) {
    const teacherId = teacher._id.toString();
    
    // Check cache first
    if (!this.teacherPrefCache.has(teacherId)) {
      const pref = await TeacherPreference.findOne({ teacherId: teacher._id }).lean();
      this.teacherPrefCache.set(teacherId, pref || {});
    }
    
    const pref = this.teacherPrefCache.get(teacherId);
    const dayPrefs = pref?.availableTimeSlots?.[day.toLowerCase()] || {};
    return typeof dayPrefs[timeSlot] !== 'undefined' ? dayPrefs[timeSlot] : this.AVAILABLE;
  }

  async initializeTracking() {
    const teacherLimits = new Map();
    const classroomAvailability = new Map();

    // Batch fetch all teacher preferences
    const teacherIds = this.teachers.map(t => t._id);
    const teacherPrefs = await TeacherPreference.find({ 
      teacherId: { $in: teacherIds } 
    }).lean();
    
    // Create a map for quick lookup
    const prefMap = new Map(teacherPrefs.map(p => [p.teacherId.toString(), p]));

    // Initialize teacher limits:
    for (const teacher of this.teachers) {
      const pref = prefMap.get(teacher._id.toString());
      teacherLimits.set(teacher._id.toString(), {
        daily: new Map(this.days.map(day => [day, { count: 0, lastIndex: -1 }])),
        weekly: 0,
        maxDaily: pref?.maxSlotsPerDay || 6,
        maxWeekly: pref?.maxSlotsPerWeek || 30
      });
    }

    // Initialize classroom availability:
    const classrooms = await Classroom.find({});
    for (const classroom of classrooms) {
      classroomAvailability.set(classroom._id.toString(), {
        slots: new Map(this.days.map(day => [
          day, new Map(this.timeSlots.map(slot => [slot, true]))
        ]))
      });
    }

    return { teacherLimits, classroomAvailability };
  }

  async generateTimetable() {
    try {
      console.log('🚀 Starting timetable generation...');
      
      // Batch fetch all required data upfront
      const [teachers, subjects, studentGroups, classrooms] = await Promise.all([
        User.find({ role: 'teacher' }).lean(),
        Subject.find({}).lean(),
        StudentGroup.find({}).lean(),
        Classroom.find({}).lean()
      ]);
      
      this.teachers = teachers;
      
      // Clear existing timetable slots and reset student group timetables
      await TimetableSlot.deleteMany({});
      await Promise.all(studentGroups.map(group => 
        StudentGroup.findByIdAndUpdate(
          group._id, 
          { $set: { timetable: [] } },
          { new: true }
        )
      ));
      
      // Pre-cache classrooms
      this.classrooms = classrooms;

      const { teacherLimits, classroomAvailability } = await this.initializeTracking();
      this.teacherLimits = teacherLimits;
      this.classroomAvailability = classroomAvailability;

      // Generate timetable for each student group
      for (const studentGroup of studentGroups) {
        console.log(`\n📚 Generating timetable for group: ${studentGroup.name}`);
        
        // Reset teacher limits for each group
        await this.initializeTracking();

        // For each time slot index, loop through all days
        for (let slotIndex = 0; slotIndex < this.timeSlots.length; slotIndex++) {
          for (const day of this.days) {
            const timeSlot = this.timeSlots[slotIndex];
            console.log(`\n📅 ${day} - Time slot: ${timeSlot}`);

            const previousAssignment = await this.tryContinuePreviousForDay(day, timeSlot, studentGroup);
            if (previousAssignment) continue;

            const bestTeacher = await this.findBestTeacher(day, timeSlot);
            if (!bestTeacher) continue;
            
            await this.assignSlot(bestTeacher, day, timeSlot, studentGroup);
          }
        }
      }

      console.log('✅ Timetable generation completed!');
      return this.getFormattedTimetable();
    } catch (error) {
      console.error('❌ Generation failed:', error);
      throw error;
    }
  }

  // Similar to tryContinuePrevious but scoped to a given day.
  async tryContinuePreviousForDay(day, timeSlot, studentGroup) {
    for (const teacher of this.teachers) {
      const teacherPref = await this.getTeacherPreference(teacher, day, timeSlot);
      if (teacherPref === this.UNAVAILABLE) continue;

      const teacherId = teacher._id.toString();
      const limits = this.teacherLimits.get(teacherId);
      const dayInfo = limits.daily.get(day);
      if (dayInfo.count === 0) continue;

      if (
        dayInfo.count >= limits.maxDaily ||
        limits.weekly >= limits.maxWeekly ||
        !this.isClassroomAvailable(day, timeSlot)
      ) continue;

      const classroom = await this.findAvailableClassroom(day, timeSlot);
      if (!classroom) continue;

      const subject = await this.selectSubject(teacher);
      if (!subject) continue;

      // Create the timetable slot
      const slot = await TimetableSlot.create({
        timetableId: this.timetableId,
        dayName: day,
        timeSlotName: timeSlot,
        teacherId: teacher._id,
        subjectId: subject._id,
        studentGroupId: studentGroup._id,
        classroomId: classroom._id
      });

      // Add the slot to student group's timetable array
      await StudentGroup.findByIdAndUpdate(
        studentGroup._id,
        { $push: { timetable: slot._id } }
      );

      dayInfo.count++;
      dayInfo.lastIndex = this.timeSlots.indexOf(timeSlot);
      limits.weekly++;

      this.markClassroomUnavailable(classroom._id.toString(), day, timeSlot);
      console.log(`🔁 Continued ${teacher.name} on ${day} at ${timeSlot}`);
      return { teacher, subject };
    }
    return null;
  }

  async findBestTeacher(day, timeSlot) {
    const candidates = [];
    const currentSlotIndex = this.timeSlots.indexOf(timeSlot);

    for (const teacher of this.teachers) {
      // Get the teacher's preference first; skip if unavailable.
      const teacherPref = await this.getTeacherPreference(teacher, day, timeSlot);
      if (teacherPref === this.UNAVAILABLE) continue;

      const teacherId = teacher._id.toString();
      const limits = this.teacherLimits.get(teacherId);
      const dayInfo = limits.daily.get(day);
      if (dayInfo.count >= limits.maxDaily) continue;
      if (limits.weekly >= limits.maxWeekly) continue;

      const subjects = await this.getTeachableSubjects(teacher);
      if (subjects.length === 0) continue;

      const consecutiveScore = this.calculateConsecutiveScore(teacherId, day, currentSlotIndex);
      const remainingSlots = limits.maxWeekly - limits.weekly;
      // Bonus for under-filled day (target = maxWeekly / number of days)
      const targetPerDay = limits.maxWeekly / this.days.length;
      const dailyUnderfillBonus = (targetPerDay - dayInfo.count) * 10; // adjust as needed

      const score = (teacherPref * 100) +
                    (remainingSlots * 30) +
                    (consecutiveScore * 50) +
                    (subjects.length * 20) +
                    dailyUnderfillBonus;
      candidates.push({ teacher, score, subjects, teacherPref });
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }

  calculateConsecutiveScore(teacherId, day, currentSlotIndex) {
    const dayInfo = this.teacherLimits.get(teacherId).daily.get(day);
    if (dayInfo.lastIndex === -1) return 0;
    const gap = currentSlotIndex - dayInfo.lastIndex - 1;
    if (gap < 0) return 0;
    return gap === 0 ? 2 : 2 / (gap + 1);
  }

  async assignSlot(candidate, day, timeSlot, studentGroup) {
    const teacher = candidate.teacher;
    const teacherId = teacher._id.toString();
    const subject = await this.selectSubject(teacher);
    if (!subject) return null;

    const classroom = await this.findAvailableClassroom(day, timeSlot);
    if (!classroom) return null;

    // Create the timetable slot
    const slot = await TimetableSlot.create({
      timetableId: this.timetableId,
      dayName: day,
      timeSlotName: timeSlot,
      teacherId: teacher._id,
      subjectId: subject._id,
      studentGroupId: studentGroup._id,
      classroomId: classroom._id
    });

    // Add the slot to student group's timetable array
    await StudentGroup.findByIdAndUpdate(
      studentGroup._id,
      { $push: { timetable: slot._id } }
    );

    const limits = this.teacherLimits.get(teacherId);
    const dayInfo = limits.daily.get(day);
    dayInfo.count++;
    dayInfo.lastIndex = this.timeSlots.indexOf(timeSlot);
    limits.weekly++;

    this.markClassroomUnavailable(classroom._id.toString(), day, timeSlot);
    console.log(`✅ Assigned ${teacher.name} on ${day} at ${timeSlot} (${limits.weekly}/${limits.maxWeekly})`);
    return { teacher, subject };
  }

  async selectSubject(teacher) {
    const populatedTeacher = await User.findById(teacher._id).populate('metadata.subjects');
    const subjects = populatedTeacher.metadata?.subjects || [];
    return subjects.length > 0 ? subjects[0] : null;
  }

  async findAvailableClassroom(day, timeSlot) {
    for (const [classroomId, availability] of this.classroomAvailability) {
      if (availability.slots.get(day).get(timeSlot)) {
        return Classroom.findById(classroomId);
      }
    }
    return null;
  }

  markClassroomUnavailable(classroomId, day, timeSlot) {
    const classroom = this.classroomAvailability.get(classroomId);
    if (classroom) {
      classroom.slots.get(day).set(timeSlot, false);
    }
  }

  isClassroomAvailable(day, timeSlot) {
    return [...this.classroomAvailability.values()].some(classroom =>
      classroom.slots.get(day).get(timeSlot)
    );
  }

  async getTeachableSubjects(teacher) {
    const populatedTeacher = await User.findById(teacher._id).populate('metadata.subjects');
    return populatedTeacher.metadata?.subjects || [];
  }

  async getFormattedTimetable() {
    // Get all student groups with populated timetable slots
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

    // Transform the data into the required format
    const formattedSlots = [];
    for (const group of studentGroups) {
      if (group.timetable && group.timetable.length > 0) {
        formattedSlots.push(...group.timetable);
      }
    }

    // Sort all slots by day and time
    return formattedSlots.sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const dayDiff = dayOrder.indexOf(a.dayName) - dayOrder.indexOf(b.dayName);
      if (dayDiff !== 0) return dayDiff;
      return a.timeSlotName.localeCompare(b.timeSlotName);
    });
  }
}

export default TimetableGenerator;
