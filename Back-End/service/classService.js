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

  // שלב 1: שלוף מערכת שעות של הכיתה
  const timetable = await Timetable.findOne({ className: classId });
  if (!timetable) throw new Error("לא נמצאה מערכת שעות לכיתה");
  console.log("1");
  const now = new Date();
  console.log("2");
  // שלב 2: מצא את השיעור הבא
  const upcomingLesson = timetable.lessons
    .filter(
      (lesson) =>
        lesson.teacherId.toString() === teacherId.toString() &&
        lesson.subject === subject
    )
    .map((lesson) => {
      const [startHour, startMinute] = lesson.startTime.split(":").map(Number);
      const dayOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"].indexOf(lesson.day);

      if (dayOfWeek === -1) return null;

      // צור תאריך לשיעור הבא באותו יום בשבוע
      const nextLessonDate = new Date(now);
      nextLessonDate.setDate(
        now.getDate() + ((dayOfWeek + 7 - now.getDay()) % 7 || 7)
      );
      nextLessonDate.setHours(startHour, startMinute, 0, 0);
      return nextLessonDate;
    })
    .filter(Boolean)
    .sort((a, b) => a - b)[0]; // השיעור הקרוב ביותר
    console.log("3");
  if (!upcomingLesson) throw new Error("לא נמצא שיעור קרוב למורה הזה בכיתה הזאת");
console.log("4");
  // 2. צור שיעורי בית עם המקצוע
  const homework = new HomeworkClass({
    classId,
    teacherId,
    subject: teacher.subject, // ❗ נשלף מהמסד
    content,
    dueDate: upcomingLesson,
  });
console.log("5");
  return await homework.save();
};
