import mongoose from 'mongoose';
import TimetableGenerator from '../services/timetableGenerator.js';

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/school_timetable');
    console.log('Connected to MongoDB');

    // Create timetable generator instance
    const generator = new TimetableGenerator();

    // Generate timetable
    const success = await generator.generateTimetable();
    
    if (success) {
      console.log('Timetable generated successfully!');
    } else {
      console.log('Failed to generate timetable');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
