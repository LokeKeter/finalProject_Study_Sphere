const Timetable = require("../models/Timetable");
const Class = require("../models/Class");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const HomeworkClass   = require("../models/HomeworkClass");
const Communication = require("../models/Communication");
const Student = require("../models/Student");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const DEBUG_ATTENDANCE = process.env.DEBUG_ATTENDANCE === '1';
const dlog = (...args) => { if (DEBUG_ATTENDANCE) console.log('[ATT]', ...args); };

const saveAttendance = async ({ date, className, subject, students, teacherId }) => {
  console.log("date: ", date);
  console.log("className: ", className);
  console.log("students: ", students);
  console.log("teacherId: ", teacherId);
  console.log("subject: ", subject);

  if (!date || !className || !students || !teacherId || !subject) {
    throw new Error("Missing required fields");
  }

  const rawDate = date;
  let dateObj = rawDate instanceof Date ? rawDate : parseDMYToDateLocal(rawDate);
  if (!dateObj) throw new Error("Invalid date format");

  dateObj.setHours(0,0,0,0);

  const newAttendance = new Attendance({
    date: dateObj,
    dateStr: typeof rawDate === 'string' ? rawDate : undefined,
    className,
    teacherId,
    subject,
    students
  });

  const savedAttendance = await newAttendance.save();

  // 1) מי שלא עשה שיעורי בית
  const homeworkMissed = students.filter(s => s.homework === false);
  console.log("תלמידים שלא עשו שיעורי בית:", homeworkMissed);

  // (קוסמטיקה קלה) אין צורך לשים teacherId פעמיים באובייקט החיפוש
  await HomeworkClass.updateMany(
    {
      classId  : className,
      teacherId: teacherId,
      subject  : subject,
      isCurrent: true
    },
    { $set: { isCurrent: false } }
  );

  // 🔁 מחליף את הבלוק הישן: מסנן בלי parentId
  const letters = homeworkMissed
    .filter(s => !!s.parentId) // רק אם יש parentId
    .map(s => ({
      type: "attend",
      senderId: teacherId,
      receiverId: s.parentId,
      subject: "לא עשה שיעורי בית",
      content: `התלמיד לא עשה שיעורי בית במקצוע "${subject}".`,
      createdAt: new Date()
    }));
  if (letters.length) {
    await Communication.insertMany(letters);
    console.log('✅ נשלחו מכתבים להורים (ש"ב):', letters.length);
  } else {
    console.log("ℹ️ אין למי לשלוח מכתבי ש\"ב (חסר parentId).");
  }

  // 2) נעדרים
  const absents = students.filter(s => s.attendance === false);

  // 🔁 מחליף את הבלוק הישן: מסנן בלי parentId
  const absentLetters = absents
    .filter(s => !!s.parentId) // רק אם יש parentId
    .map(s => ({
      type: "attend",
      senderId: teacherId,
      receiverId: s.parentId,
      subject: `לא נכח - ${subject}`,
      content: `התלמיד לא נכח בשיעור "${subject}".`,
      createdAt: new Date()
    }));
  if (absentLetters.length) {
    await Communication.insertMany(absentLetters);
    console.log("✅ נשלחו מכתבי היעדרות:", absentLetters.length);
  } else {
    console.log("ℹ️ אין למי לשלוח מכתבי היעדרות (חסר parentId).");
  }

  return savedAttendance;
};

//שליפת מקצוע של המורה
const getTeacherSubject = async (teacherId) => {
  const teacher = await User.findById(teacherId);
  return teacher.subject;
};

// שליפת כיתות לפי מורה
const getTeacherClasses = async (teacherId) => {
  const teacher = await User.findById(teacherId).select("assignedClasses").lean();
  if (!teacher || !Array.isArray(teacher.assignedClasses)) return [];
  return [...new Set(teacher.assignedClasses.map(String))];
};

// attendanceService.js
const getStudentsByClass = async ({ teacherId, grade }) => {
  // מאשר שהמורה אכן מלמד את הכיתה הזו
  const teacher = await User.findById(teacherId).select('assignedClasses').lean();
  if (!teacher?.assignedClasses?.includes(grade)) return [];

  // שליפת הכיתה+הורה
  const classDoc = await Class
    .findOne({ grade })
    .populate('students.parentId', 'name') // << כאן נקבל את שם ההורה
    .lean();

  if (!classDoc) return [];

  // שמות תלמידים מה-Student (לפי studentId = ת"ז)
  const ids = (classDoc.students || []).map(s => String(s.studentId)).filter(Boolean);
  const studentsDocs = await Student.find({ studentId: { $in: ids } })
                                    .select('studentId name').lean();
  const nameByNationalId = new Map(studentsDocs.map(s => [String(s.studentId), s.name]));

  return (classDoc.students || []).map(s => ({
    parentId: s.parentId?._id || null,
    parentName: s.parentId?.name || 'לא ידוע',
    studentName: nameByNationalId.get(String(s.studentId)) || 'לא ידוע',
  }));
};

const getClassesForTeacher = async (teacherId) => {
  const timetables = await Timetable.find({ "lessons.teacherId": teacherId });

  // מחלץ רק את שמות הכיתות הייחודיים
  const classNames = timetables.map(t => t.className);
  return [...new Set(classNames)];
};

function parseDMYToDateLocal(s) {
  if (!s) return null;
  const str = String(s).trim();
  const [datePart] = str.split(/\s+/);
  const [dd, mm, yyyy] = (datePart || '').split(/[./-]/).map(n => parseInt(n, 10));
  if (!dd || !mm || !yyyy) {
    dlog('parseDMYToDateLocal: failed to parse', { input: s });
    return null;
  }
  const d = new Date(yyyy, (mm - 1), dd, 0, 0, 0, 0); // חצות מקומי
  return d;
}

const getAttendanceByClassAndDate = async (className, dateStr) => {
  const d = parseDMYToDateLocal(dateStr);
  if (!d) return [];
  const start = new Date(d); start.setHours(0,0,0,0);
  const end   = new Date(d); end.setHours(23,59,59,999);

  return Attendance.find({
    className,
    date: { $gte: start, $lte: end }
  }).lean();
};

const getSummary = async ({ teacherId, days = 7 } = {}) => {
  // חלון [start, end) – עד מחר בחצות כדי לכלול את היום הנוכחי
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);

  const start = new Date(end);
  start.setDate(end.getDate() - days);

  const teacherFilter = teacherId
    ? {
        teacherId: mongoose.Types.ObjectId.isValid(teacherId)
          ? new mongoose.Types.ObjectId(teacherId)
          : teacherId
      }
    : {};

  const matchStage = { ...teacherFilter, createdAt: { $gte: start, $lt: end } };

  const rows = await Attendance.aggregate([
    { $match: matchStage },
    { $unwind: "$students" },
    {
      $group: {
        _id: null,
        present: { $sum: { $cond: [{ $eq: ["$students.attendance", true] }, 1, 0] } },
        absent:  { $sum: { $cond: [{ $eq: ["$students.attendance", false] }, 1, 0] } }
      }
    },
    { $project: { _id: 0, present: 1, absent: 1, total: { $add: ["$present", "$absent"] } } }
  ]);

  if (!rows.length) return { present: 0, absent: 0, total: 0 };
  return rows[0];
};

function parentIdFromToken(token) {
  if (!token) {
    const err = new Error('token is required');
    err.status = 400;
    throw err;
  }
  const raw = String(token).replace(/^Bearer\s+/i, '');
  let decoded;
  try {
    decoded = jwt.verify(raw, process.env.JWT_SECRET);
  } catch {
    const err = new Error('invalid token');
    err.status = 401;
    throw err;
  }
  const parentId = decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;
  if (!parentId) {
    const err = new Error('parent id not found in token');
    err.status = 401;
    throw err;
  }
  return parentId;
}

// ניסיון חביב להוציא שם מקצוע מההודעה (כדי לבנות טקסט יפה)
function inferSubject(comm) {
  // "לא נכח - ספורט"
  if (comm?.subject && comm.subject.startsWith('לא נכח - ')) {
    return comm.subject.replace('לא נכח - ', '').trim();
  }
  // התלמיד לא עשה שיעורי בית במקצוע "ספורט".
  const m = /"([^"]+)"/.exec(comm?.content || '');
  if (m) return m[1].trim();
  return comm?.meta?.subject || comm?.subjectName || '';
}

async function getParentDisciplineByToken(token, days = 7) {
  if (!token) {
    const err = new Error('token is required');
    err.status = 400;
    throw err;
  }

  // תמיכה ב"Bearer ..."
  const raw = String(token).replace(/^Bearer\s+/i, '');

  // מפענח טוקן => מזהה הורה
  let decoded;
  try {
    decoded = jwt.verify(raw, process.env.JWT_SECRET);
  } catch (e) {
    const err = new Error('invalid token');
    err.status = 401;
    throw err;
  }

  const parentId =
    decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;
  if (!parentId) {
    const err = new Error('parent id not found in token');
    err.status = 401;
    throw err;
  }

  // חלון זמן – ברירת מחדל: שבוע אחורה (כולל היום)
  const since = new Date();
  since.setDate(since.getDate() - (Number(days) || 7));
  since.setHours(0, 0, 0, 0);

  // המרה ל־ObjectId אם רלוונטי
  const pid = mongoose.Types.ObjectId.isValid(parentId)
    ? new mongoose.Types.ObjectId(parentId)
    : parentId;

  // שליפה מ-COMMUNICATION: רק type=attend, המקבל הוא ההורה, ובשבוע האחרון
  const rows = await Communication.find(
    {
      type: 'attend',
      receiverId: pid,
      createdAt: { $gte: since },
    },
    {
      subject: 1,
      content: 1,
      createdAt: 1,
    }
  )
  .sort({ createdAt: -1 })
  .limit(500) // מגן – אפשר לשנות/להסיר
  .lean();

  // בנורמליזציה נבנה כותרת "לא נכח ב{מקצוע}" או "לא הכין שיעורי בית • {מקצוע}"
  const items = [];
  for (const r of rows) {
    const subjRaw = String(r.subject || '');
    const content = String(r.content || '');

    // ננסה לשלוף את שם המקצוע
    let subjectName = null;

    // 1) "לא נכח - {מקצוע}"
    const mAbs = subjRaw.match(/^לא\s*נכח\s*-\s*(.+)$/);
    if (mAbs) subjectName = mAbs[1].trim();

    // 2) מתוך התוכן (לש"ב): התלמיד לא עשה שיעורי בית במקצוע "{מקצוע}".
    if (!subjectName) {
      const mHw = content.match(/במקצוע\s+"([^"]+)"/);
      if (mHw) subjectName = mHw[1].trim();
    }

    // זיהוי סוג
    const isAbs  = /^לא\s*נכח/i.test(subjRaw) || /לא\s*נכח/i.test(content);
    const isHw   = /שיעורי\s*בית|ש"ב/i.test(subjRaw) || /שיעורי\s*בית|ש"ב/i.test(content);

    let title;
    if (isAbs) {
      title = `לא נכח ב${subjectName || ''}`.trim();
    } else if (isHw) {
      title = `לא הכין שיעורי בית • ${subjectName || ''}`.replace(/\s•\s$/, '').trim();
    } else {
      // fallback
      title = subjRaw || 'אירוע';
    }

    items.push({
      id: String(r._id),
      title,
      date: r.createdAt, // תאריך התרחשות/שליחה
    });
  }

  return items;
}

function getParentIdFromToken(token) {
  if (!token) {
    const err = new Error('token is required');
    err.status = 400;
    throw err;
  }
  const raw = String(token).replace(/^Bearer\s+/i, '');
  let decoded;
  try {
    decoded = jwt.verify(raw, process.env.JWT_SECRET);
  } catch {
    const err = new Error('invalid token');
    err.status = 401;
    throw err;
  }
  const parentId = decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;
  if (!parentId) {
    const err = new Error('parent id not found in token');
    err.status = 401;
    throw err;
  }
  return parentId;
}

function sinceForRange(range = 'weekly') {
  const now = new Date();
  const since = new Date(now);
  switch (String(range).toLowerCase()) {
    case 'daily':
    case 'day':
      since.setHours(0, 0, 0, 0);
      return since;
    case 'weekly':
    case 'week':
      since.setDate(now.getDate() - 7);
      since.setHours(0, 0, 0, 0);
      return since;
    case 'monthly':
    case 'month':
      since.setMonth(now.getMonth() - 1);
      since.setHours(0, 0, 0, 0);
      return since;
    case 'semester':
    case 'semesterly':
    case 'sem':
      since.setMonth(now.getMonth() - 4);
      since.setHours(0, 0, 0, 0);
      return since;
    case 'yearly':
    case 'year':
      since.setFullYear(now.getFullYear() - 1);
      since.setHours(0, 0, 0, 0);
      return since;
    default:
      since.setDate(now.getDate() - 7);
      since.setHours(0, 0, 0, 0);
      return since;
  }
}
const parentPieByToken = async ({ token, range = 'weekly' } = {}) => {
  const parentId = getParentIdFromToken(token);
  const since = sinceForRange(range);

  const pidObj = mongoose.Types.ObjectId.isValid(parentId)
    ? new mongoose.Types.ObjectId(parentId)
    : null;

  const matchParent = pidObj
    ? { $or: [{ "students.parentId": pidObj }, { "students.parentId": String(parentId) }] }
    : { "students.parentId": String(parentId) };

  const agg = await Attendance.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $unwind: "$students" },
    { $match: matchParent },
    {
      $group: {
        _id: null,
        present: {
          $sum: {
            $cond: [{ $eq: ["$students.attendance", true] }, 1, 0]
          }
        },
        absent: {
          $sum: {
            $cond: [{ $eq: ["$students.attendance", false] }, 1, 0]
          }
        },
      }
    }
  ]);

  const row = agg[0] || { present: 0, absent: 0 };
  return { present: row.present || 0, absent: row.absent || 0, since };
};

module.exports = {
  getAttendanceByClassAndDate,
  getTeacherClasses,
  getTeacherSubject,
  getSummary,
  getStudentsByClass,
  saveAttendance,
  getParentDisciplineByToken,
  getParentIdFromToken,
  getClassesForTeacher,
  parentPieByToken
};
