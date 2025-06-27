const Timetable = require("../models/Timetable");
const Class = require("../models/Class");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

const saveAttendance = async ({ date, className, students }) => {
  if (!date || !className || !students) {
    throw new Error("Missing required fields");
  }

  const newAttendance = new Attendance({
    date,
    className,
    students
  });

  return await newAttendance.save();
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
