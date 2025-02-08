import mongoose from 'mongoose';
const { Schema } = mongoose;

const StudentGroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  academicYear: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subjects: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }],
    default: []
  },
  timetable: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimetableSlot'
    }],
    default: [],
    validate: {
      validator: function(slots) {
        // Ensure no duplicate slots
        const uniqueSlots = new Set(slots.map(s => s.toString()));
        return uniqueSlots.size === slots.length;
      },
      message: 'Duplicate timetable slots are not allowed'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for faster lookups
StudentGroupSchema.index({ name: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('StudentGroup', StudentGroupSchema);