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

const getAttendanceSummary = async (req, res) => {
  try {
    const teacherId = req.user && req.user.id; // מגיע מה-auth middleware
    const days = Number(req.query.days || 7);

    const { present, absent, total } = await attendanceService.getSummary({ teacherId, days });
    return res.json({ present, absent, total });
  } catch (err) {
    console.error('❌ getAttendanceSummary:', err);
    return res.status(500).json({ message: 'Failed to fetch attendance summary' });
  }
};

// רק להורים: “משמעת” שבוע אחורה מתוך Attendance
const disciplineForParent = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const token = req.headers.authorization || req.query.token || '';
    const items = await attendanceService.getParentDisciplineByToken(token, days);
    res.json(items);
  } catch (err) {
    console.error('[controller] disciplineForParent error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Internal error' });
  }
};

const parentPie = async (req, res) => {
  try {
    const token = req.headers.authorization || req.headers.Authorization;
    const range = req.query.range || req.query.r || 'weekly';
    const data = await attendanceService.parentPieByToken({ token, range });
    res.json(data);
  } catch (err) {
    console.error('❌ parentPie error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

module.exports = {
  saveAttendance,
  getAttendanceByClassAndDate,
  getAttendanceByStudent,
  getAttendanceSummary,
  getTeacherClasses,
  getStudentsByClass,
  getTeacherSubject,
  parentPie,
  disciplineForParent
};
