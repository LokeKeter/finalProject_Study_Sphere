const Timetable = require("../models/Timetable");
const Class = require("../models/Class");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const HomeworkClass   = require("../models/HomeworkClass");
const Communication = require("../models/Communication");
const Student = require("../models/Student");

const saveAttendance = async ({ date, className, subject, students, teacherId }) => {
  console.log("date: ", date);
  console.log("className: ", className);
  console.log("students: ", students);
  console.log("teacherId: ", teacherId);
  console.log("subject: ", subject);

  if (!date || !className || !students || !teacherId || !subject) {
    throw new Error("Missing required fields");
  }

  const newAttendance = new Attendance({
    date,
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

module.exports = {
  getTeacherClasses,
  getTeacherSubject,
  getStudentsByClass,
  saveAttendance,
  getClassesForTeacher
};
