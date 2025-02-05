import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'teacher', 'student'], 
    required: true 
  },  
  name: { 
    type: String, 
    required: true 
  },
  metadata: {
    // For teachers
    subjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }],
    department: String,

    // For students
    studentGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentGroup',
      default: null
    },
    year: {
      type: String,
      default: null
    },
    section: {
      type: String,
      default: null
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware to hash the password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method for comparing passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
