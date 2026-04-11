require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const connectDB = require('./config/db');

// Controllers
const studentController = require('./controllers/studentController');
const attendanceController = require('./controllers/attendanceController');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Set up Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// API Routes

// 1. Student Registration
app.post('/api/students/register', upload.single('faceImage'), studentController.registerStudent);
app.get('/api/students', studentController.getAllStudents);

// 2. Attendance
app.post('/api/attendance/take', upload.single('groupImage'), attendanceController.takeAttendance);
app.get('/api/attendance/logs', attendanceController.getAttendanceLogs);

// Basic route
app.get('/', (req, res) => {
  res.send('Facial Recognition Attendance API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
