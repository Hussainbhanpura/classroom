import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeBloomFilter } from './utils/bloomFilter.js';

// Import routes
import loginRoute from './routes/loginRoute.js';
import timetableRoute from './routes/timetableRoute.js';
import studentGroupRoute from './routes/studentGroupRoute.js';
import subjectRoute from './routes/subjectRoute.js';
import classroomRoutes from './routes/classroomRoute.js';
import teacherPreferenceRoutes from './routes/teacherPreferenceRoute.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Use routes
app.use('/api', loginRoute);
app.use('/api', timetableRoute);
app.use('/api', studentGroupRoute);
app.use('/api', subjectRoute);
app.use('/api', classroomRoutes);
app.use('/api', teacherPreferenceRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
      socketTimeoutMS: 45000, // Increase socket timeout
      family: 4 // Use IPv4, skip trying IPv6
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize Bloom filter after successful connection
    mongoose.connection.once('open', () => {
      console.log('MongoDB connection opened');
      initializeBloomFilter();
    });

    // Handle connection errors
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Exit process with failure if initial connection fails
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
