const HomeworkClass = require("../models/HomeworkClass");
const User = require("../models/User");
const Timetable = require("../models/Timetable");

exports.sendHomeworkToClass = async ({ classId, teacherId, content }) => {
  // 1. שלוף את המורה
  const teacher = await User.findById(teacherId);

  if (!teacher) {
    throw new Error("מורה לא נמצא");
  }

  if (!teacher.subject) {
    throw new Error("למורה אין מקצוע מוגדר");
  }
  const subject = teacher.subject;

  console.log("📌 classId:", classId);
  console.log("📌 teacherId:", teacherId);
  console.log("📌 subject:", subject);
  console.log("📌 content:", content);
  console.log("📌 מציאת מערכת שעות");

  // 2. צור שיעורי בית עם המקצוע
  const homework = new HomeworkClass({
    classId,
    teacherId,
    subject: teacher.subject, // ❗ נשלף מהמסד
    content,
    isCurrent: true,
  });
console.log("5");
  return await homework.save();
};
