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
      // Only required if role is student
      required: function() {
        return this.role === 'student';
      }
    },
    year: {
      type: String,
      required: function() {
        return this.role === 'student';
      }
    },
    section: {
      type: String,
      required: function() {
        return this.role === 'student';
      }
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Hash password before saving
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

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);