const Timetable = require("../models/Timetable");
const Class = require("../models/Class");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Communication = require("../models/Communication");

const saveAttendance = async ({ date, className, subject, students, teacherId }) => {
  if (!date || !className || !students) {
    throw new Error("Missing required fields");
  }

  const newAttendance = new Attendance({
    date,
    className,
    students
  });

  const savedAttendance = await newAttendance.save();

  const homeworkMissed = students.filter(s => s.homework === false);
  console.log("תלמידים שלא עשו שיעורי בית:", homeworkMissed);

  if (homeworkMissed.length > 0) {
    const letters = homeworkMissed.map(s => ({
      type: "letter",
      senderId: teacherId, // כאן מזהה המורה
      receiverId: s.parentId,
      subject: "לא עשה שיעורי בית",
      content: `התלמיד לא עשה שיעורי בית במקצוע "${subject}".`,
      createdAt: new Date()
    }));

    await Communication.insertMany(letters);
    console.log("✅ נשלחו מכתבים להורים:", letters);
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
  const timetables = await Timetable.find({ "lessons.teacherId": teacherId });
  const classNames = timetables.map(t => t.className);
  return [...new Set(classNames)];
};

const getStudentsByClass = async (grade) => {
  const classDoc = await Class.findOne({ grade }).populate("students.parentId", "name");
  if (!classDoc) return [];
  const results = await Promise.all(
    classDoc.students.map(async (s) => {
      const student = await User.findOne(s.parentId?._id );
      return {
        parentId: s.parentId?._id,
        parentName: s.parentId?.name || "לא ידוע",
        studentName: student?.studentName || "תלמיד לא נמצא"
      };
    })
  );
  return results;
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
