import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the time slots
const timeSlots = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM'
];

// Define the days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Create a default availability matrix (all slots available)
const defaultAvailability = {};
daysOfWeek.forEach(day => {
  defaultAvailability[day] = {};
  timeSlots.forEach(slot => {
    defaultAvailability[day][slot] = true;
  });
});

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
  },
  availability: {
    type: Object,
    default: defaultAvailability
  }
}, {
  timestamps: true
});

// Export time slots and days for use in the frontend
export const TIME_SLOTS = timeSlots;
export const DAYS_OF_WEEK = daysOfWeek;

export default mongoose.model('Classroom', ClassroomSchema);