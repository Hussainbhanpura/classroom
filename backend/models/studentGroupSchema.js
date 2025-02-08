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
    default: [] // Ensure subjects array is initialized as empty array
  },

  timetable: [[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimetableEntry'
  }]]
}, {
  timestamps: true
});

export default mongoose.model('StudentGroup', StudentGroupSchema);