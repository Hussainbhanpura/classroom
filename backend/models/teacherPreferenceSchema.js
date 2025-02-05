import mongoose from 'mongoose';

const timeSlotSchema = {
  '9:00 AM': {
    type: Number,
    enum: [1, 0, -1],
    default: 0
  },
  '10:00 AM': {
    type: Number,
    enum: [1, 0, -1],
    default: 0
  },
  '11:00 AM': {
    type: Number,
    enum: [1, 0, -1],
    default: 0
  },
  '12:00 PM': {
    type: Number,
    enum: [1, 0, -1],
    default: 0
  },
  '1:00 PM': {
    type: Number,
    enum: [1, 0, -1],
    default: 0
  },
  '2:00 PM': {
    type: Number,
    enum: [1, 0, -1],
    default: 0
  },
  '3:00 PM': {
    type: Number,
    enum: [1, 0, -1],
    default: 0
  },
  '4:00 PM': {
    type: Number,
    enum: [1, 0, -1],
    default: 0
  }
};

const availableTimeSlotsSchema = {
  monday: timeSlotSchema,
  tuesday: timeSlotSchema,
  wednesday: timeSlotSchema,
  thursday: timeSlotSchema,
  friday: timeSlotSchema
};

const TeacherPreferenceSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  maxSlotsPerDay: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
    default: 6,
    validate: {
      validator: Number.isInteger,
      message: 'Maximum slots per day must be an integer'
    }
  },
  maxSlotsPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 40,
    default: 25,
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value >= this.maxSlotsPerDay;
      },
      message: 'Maximum slots per week must be an integer greater than or equal to maximum slots per day'
    }
  },
  availableTimeSlots: {
    type: availableTimeSlotsSchema,
    default: () => {
      const defaultSlots = {};
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        defaultSlots[day] = {};
        ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
         '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].forEach(slot => {
          defaultSlots[day][slot] = 0; // 0 = available
        });
      });
      return defaultSlots;
    }
  }
}, {
  timestamps: true
});

// Ensure each teacher can only have one preference document
TeacherPreferenceSchema.index({ teacherId: 1 }, { unique: true });

export default mongoose.model('TeacherPreference', TeacherPreferenceSchema);
