const attendanceService = require("../service/attendanceService");

const saveAttendance = async (req, res) => {
  try {
    const { date, className, students, subject } = req.body;
    const teacherId = req.user.id;
    const result = await attendanceService.saveAttendance({ date, className, students, teacherId, subject });

    res.status(201).json({ message: "Attendance saved successfully", result });
  } catch (error) {
    console.error("❌ Error saving attendance:", error.message);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

const getAttendanceByClassAndDate = async (req, res) => {
  try {
    const { className, date } = req.params;
    const result = await attendanceService.getAttendanceByClassAndDate(className, date);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await attendanceService.getAttendanceByStudent(studentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// שליפת כיתות שהמורה מלמד
const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const classes = await attendanceService.getTeacherClasses(teacherId);
    res.json(classes);
  } catch (error) {
    console.error("❌ שגיאה בשליפת כיתות:", error);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

// שליפת תלמידים לפי כיתה
const getStudentsByClass = async (req, res) => {
  try {
    const grade = req.params.grade;
    const teacherId = req.user?.id || req.user?._id;
    if (!teacherId) {
      return res.status(401).json({ error: 'לא מאומת' });
    }

    // השירות מעודכן לקבל { teacherId, grade } ולוודא שהכיתה ב-assignedClasses של המורה
    const students = await attendanceService.getStudentsByClass({ teacherId, grade });

    // אם השירות בוחר להחזיר [] כשאין הרשאה, פשוט נחזיר []
    return res.json(students);
  } catch (error) {
    console.error("❌ שגיאה בשליפת תלמידים:", error);
    return res.status(500).json({ error: "שגיאה בשרת" });
  }
};

// שליפת מקצוע של מורה
const getTeacherSubject = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const subject = await attendanceService.getTeacherSubject(teacherId);
    res.json({ subject });
  } catch (error) {
    console.error("❌ שגיאה בשליפת מקצוע:", error);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
};

module.exports = {
  saveAttendance,
  getAttendanceByClassAndDate,
  getAttendanceByStudent,
  getTeacherClasses,
  getStudentsByClass,
  getTeacherSubject
};
