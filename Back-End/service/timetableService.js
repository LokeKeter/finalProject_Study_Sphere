const Timetable = require("../models/Timetable");
const User = require("../models/User");
const { scheduleSlots, days } = require("../utils/scheduleSlots");

// 📌 הוספת שיעור חדש
const addLesson = async (lessonData) => {
  const { className } = lessonData;

  let timetable = await Timetable.findOne({ className });

  // אם אין מערכת קיימת – צור חדשה
  if (!timetable) {
    timetable = new Timetable({ className, lessons: [] });
  }

  timetable.lessons.push(lessonData); // הוסף את השיעור
  await timetable.save();
  return timetable;
};

// 📌 קבלת כל השיעורים של כיתה
const getLessonsByClass = async (className) => {
  return await Timetable.findOne({ className });
};

// 📌 מחיקת שיעור לפי ID
const deleteLesson = async (className, lessonId) => {
  const timetable = await Timetable.findOne({ className });
  if (!timetable) return null;

  timetable.lessons = timetable.lessons.filter(
    (lesson) => lesson._id.toString() !== lessonId
  );

  await timetable.save();
  return timetable;
};

// ✅ פונקציה עיקרית ליצירת מערכת שעות
async function createTimetable(className) {
  const emptyTimetable = new Timetable({ className, lessons: [] });
  await emptyTimetable.save();
  console.log(`📅 מערכת שעות נוצרה לכיתה ${className}`);
}


module.exports = {
  addLesson,
  getLessonsByClass,
  deleteLesson,
  createTimetable
};
