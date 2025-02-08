import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the classrooms collection
    const db = mongoose.connection.db;
    const collection = db.collection('classrooms');

    // Drop the incorrect email index
    await collection.dropIndex('email_1');
    console.log('Successfully dropped the incorrect email index');

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
    if (error.code === 27) {
      console.log('Index does not exist, no need to drop it');
    }
    // Close the connection even if there's an error
    await mongoose.connection.close();
  }
}

fixIndexes();
