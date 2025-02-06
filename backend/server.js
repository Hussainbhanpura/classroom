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
const MONGODB_URI = process.env.MONGODB_URI
mongoose.connect(MONGODB_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  initializeBloomFilter();
});

// Port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
