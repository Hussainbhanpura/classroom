import mongoose from 'mongoose';
const { Schema } = mongoose;

const SubjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  credits: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 6
  },
  requiredEquipment: {
    type: [String],
    default: []
  },
  studentGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentGroup',
    default: null
  },
  lecturesPerWeek: {
    type: Number,
    default: 3,
    min: 1,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Subject', SubjectSchema);
