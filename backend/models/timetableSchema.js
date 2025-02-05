import mongoose from 'mongoose';
const { Schema } = mongoose;

const TimetableSchema = new Schema({
  academicYear: {
    type: Number,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  },
  slots: [{
    type: Schema.Types.ObjectId,
    ref: 'TimetableSlot'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update timestamps on save
TimetableSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Timetable', TimetableSchema);