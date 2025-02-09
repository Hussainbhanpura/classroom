import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import profileRoutes from './routes/api/profile.js';
import studentRoute from './routes/studentRoute.js';
import teacherProgressRoutes from './routes/teacherProgress.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
	console.log(`${req.method} ${req.path}`);
	next();
});

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/students', studentRoute);
app.use('/api', teacherProgressRoutes);

// Error handling middleware

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

export default app;