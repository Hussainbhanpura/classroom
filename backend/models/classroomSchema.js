import mongoose from 'mongoose';
const { Schema } = mongoose;

const ClassroomSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  equipment: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Classroom', ClassroomSchema);