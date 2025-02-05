# Classroom Management System

A comprehensive classroom management system built with Node.js and React. This system helps educational institutions manage their timetables, teachers, students, and classroom resources efficiently.

## Features

- **Automated Timetable Generation**
  - Smart scheduling based on teacher preferences
  - Classroom availability management
  - Subject distribution optimization

- **User Management**
  - Student management with group assignments
  - Teacher management with subject specializations
  - Admin dashboard for system control

- **Resource Management**
  - Classroom allocation
  - Subject management
  - Student group organization

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: React.js, Material-UI
- **Authentication**: JWT
- **Database**: MongoDB Atlas

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Hussainbhanpura/classroom.git
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```
   PORT=3001
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Run the application:
   ```bash
   # Start backend server
   cd backend
   npm start

   # Start frontend in another terminal
   cd frontend
   npm start
   ```

## API Documentation

The API includes endpoints for:
- User authentication
- Student and teacher management
- Timetable generation and management
- Classroom and subject management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
