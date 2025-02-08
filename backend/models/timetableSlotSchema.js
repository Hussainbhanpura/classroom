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
    index: true // Add index for faster lookups
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
timetableSlotSchema.index({ teacherId: 1, dayName: 1 });

// Add virtual for reverse population
timetableSlotSchema.virtual('studentGroup', {
  ref: 'StudentGroup',
  localField: 'studentGroupId',
  foreignField: '_id',
  justOne: true
});

export const TimetableSlot = mongoose.model('TimetableSlot', timetableSlotSchema);
