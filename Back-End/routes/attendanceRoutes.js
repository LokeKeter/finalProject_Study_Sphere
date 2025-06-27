const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");

//  שמירת נוכחות ושיעורי בית
router.post("/save", authMiddleware, attendanceController.saveAttendance);

//  שליפה לפי כיתה ותאריך
router.get("/class/:className/date/:date", authMiddleware, attendanceController.getAttendanceByClassAndDate);

//  שליפה לפי תלמיד
router.get("/student/:studentId", authMiddleware, attendanceController.getAttendanceByStudent);

//כל הכיתות שמורה מלמד
router.get("/teacher-classes/:teacherId", authMiddleware, authorizeRoles(["teacher"]), attendanceController.getTeacherClasses);

//מקצוע שהמורה מלמד
router.get("/teacher-subject/:teacherId", attendanceController.getTeacherSubject);

//כל התלמידים שהמורה מלמד
router.get("/students-by-class/:grade", attendanceController.getStudentsByClass);

module.exports = router;
