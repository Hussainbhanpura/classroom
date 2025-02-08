import mongoose from 'mongoose';

const timetableSlotSchema = new mongoose.Schema({
  timetableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
    required: true
  },
  dayName: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  timeSlotName: {
    type: String,
    required: true,
    enum: [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ]
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  studentGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentGroup',
    required: true,
    index: true
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for faster queries
timetableSlotSchema.index({ timetableId: 1, dayName: 1, timeSlotName: 1 });
timetableSlotSchema.index({ dayName: 1, timeSlotName: 1, studentGroupId: 1 }, { unique: true });
timetableSlotSchema.index({ teacherId: 1, dayName: 1, timeSlotName: 1 }, { unique: true });

// Pre-save middleware to validate no conflicts
timetableSlotSchema.pre('save', async function(next) {
  try {
    // Check for existing slot at same time for student group
    const existingSlot = await this.constructor.findOne({
      _id: { $ne: this._id },
      studentGroupId: this.studentGroupId,
      dayName: this.dayName,
      timeSlotName: this.timeSlotName
    });
    if (existingSlot) {
      throw new Error('Time slot already occupied for this student group');
    }

    // Check for teacher availability
    const teacherSlot = await this.constructor.findOne({
      _id: { $ne: this._id },
      teacherId: this.teacherId,
      dayName: this.dayName,
      timeSlotName: this.timeSlotName
    });
    if (teacherSlot) {
      throw new Error('Teacher already assigned to another class at this time');
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Add virtual for reverse population
timetableSlotSchema.virtual('studentGroup', {
  ref: 'StudentGroup',
  localField: 'studentGroupId',
  foreignField: '_id',
  justOne: true
});

export const TimetableSlot = mongoose.model('TimetableSlot', timetableSlotSchema);
