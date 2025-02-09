import mongoose from 'mongoose';
const { Schema } = mongoose;

const StudentGroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    autopopulate: true,
    select: 'name'
  }],
  academicYear: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  batches: [{
    name: {
      type: String,
      required: true
    },
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }]
  }],
  timetable: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimetableSlot',
      batch: {
        type: String,
        required: false // Optional, if not specified, applies to all batches
      }
    }],
    default: [],
    validate: {
      validator: function(slots) {
        // Ensure no duplicate slots for the same batch
        const uniqueSlots = new Set(slots.map(s => `${s.toString()}-${s.batch || 'all'}`));
        return uniqueSlots.size === slots.length;
      },
      message: 'Duplicate timetable slots for the same batch are not allowed'
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