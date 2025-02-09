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
    max: 4
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
  isActive: {
    type: Boolean,
    default: true
  },
  remainingLectures: {
    type: Number,
    default: function() {
      switch (this.credits) {
        case 1:
          return 14;
        case 2:
          return 28;
        case 3:
          return 42;
        case 4:
          return 56;
        default:
          return 0;
      }
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Subject', SubjectSchema);
