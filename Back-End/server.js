const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// ייבוא כל הראוטים
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const archiveRoutes = require('./routes/archiveRoutes');

// ראוטים ראשיים
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/archives', archiveRoutes);

// טיפול ב־404 (נתיב שלא קיים)
app.use((req, res, next) => {
  res.status(404).json({ message: '❌ Route Not Found' });
});

// טיפול בשגיאות כלליות
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ message: '🔥 Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));