const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
connectDB();

app.use(cors({
  origin: ["http://localhost:8081", "http://localhost:3000"],
  credentials: true
}));
app.use(helmet());
app.use(express.json());

// Rate Limiting Middleware - הגבלת 100 בקשות לכל IP ב־15 דקות
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 100,
  message: "📛 יותר מדי בקשות – נסה שוב מאוחר יותר",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ייבוא כל הראוטים
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const classRoutes = require('./routes/classRoutes');
const archiveRoutes = require('./routes/archiveRoutes');
const taskRoutes = require('./routes/taskRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require("./routes/attendanceRoutes");
const communicationRoutes = require("./routes/communicationRoutes");
const yearlyEventRoutes = require('./routes/yearlyEventRoute');
const path = require("path");
const homeworkRoute = require('./routes/homeworkRoute');

// ראוטים ראשיים
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/class', classRoutes);
app.use('/api/archives', archiveRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/communication", communicationRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api/yearlyevents', yearlyEventRoutes);
app.use('/api/homework', homeworkRoute);

// ראוט בדיקה ראשי
app.get("/", (req, res) => {
  res.send({ message: "✅ API is running" });
});

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


