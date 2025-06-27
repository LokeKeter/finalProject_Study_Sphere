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




// ✅ פונקציה שמעדכנת את מערכות השעות כשמורה משנה מקצועות
const handleSubjectChanges = async (oldSubject, newSubject, teacherId) => {
  try {
    if (oldSubject === newSubject) return;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") return;

    // 🧹 הסר את כל השיעורים הישנים של המורה עם המקצוע הישן
    await Timetable.updateMany(
      { "lessons.teacherId": teacherId, "lessons.subject": oldSubject },
      { $pull: { lessons: { teacherId, subject: oldSubject } } }
    );

    console.log(`🗑️ הוסרו שיעורים ישנים של מורה ${teacherId} במקצוע ${oldSubject}`);

    const allTimetables = await Timetable.find({});

    for (const timetable of allTimetables) {
      const alreadyTeachingThisSubject = timetable.lessons.some(
        (l) => l.subject === newSubject
      );
      if (alreadyTeachingThisSubject) {
        console.log(`⏩ הכיתה ${timetable.className} כבר לומדת ${newSubject}, מדלג`);
        continue;
      }

      let assigned = 0;

      for (const day of days) {
        for (const slot of scheduleSlots) {
          const timeClash = await Timetable.findOne({
            "lessons.teacherId": teacherId,
            "lessons.day": day,
            "lessons.startTime": slot.start
          });

          const classTaken = timetable.lessons.some(
            (l) => l.day === day && l.startTime === slot.start
          );

          if (!timeClash && !classTaken) {
            timetable.lessons.push({
              day,
              startTime: slot.start,
              endTime: slot.end,
              subject: newSubject,
              teacherId: teacherId,
              className: timetable.className
            });

            assigned++;
            console.log(`✅ שובץ שיעור של ${newSubject} בכיתה ${timetable.className} ביום ${day} בשעה ${slot.start}`);
          }

          if (assigned === 2) break;
        }
        if (assigned === 2) break;
      }

      await timetable.save();
    }

    console.log(`📚 הסתיים שיבוץ המורה ${teacher.name} למקצוע ${newSubject}`);
  } catch (error) {
    console.error("❌ שגיאה ב־handleSubjectChanges:", error);
  }
};


// ✅ פונקציה עיקרית ליצירת מערכת שעות
async function createTimetable(className) {
  const emptyTimetable = new Timetable({ className, lessons: [] });
  const teachers = await User.find({ role: "teacher", subject: { $ne: null } });

  for (const teacher of teachers) {
    const subject = teacher.subject;
    let assigned = 0;

    for (const day of days) {
      for (const slot of scheduleSlots) {
        const isTakenByTeacher = await Timetable.exists({
          "lessons.teacherId": teacher._id,
          "lessons.day": day,
          "lessons.startTime": slot.start
        });

        const isTakenByClass = emptyTimetable.lessons.some(
          (l) => l.day === day && l.startTime === slot.start
        );

        if (!isTakenByTeacher && !isTakenByClass) {
          emptyTimetable.lessons.push({
            day,
            startTime: slot.start,
            endTime: slot.end,
            subject,
            teacherId: teacher._id,
            className
          });

          assigned++;
          if (assigned === 2) break;
        }
      }
      if (assigned === 2) break;
    }
  }

  await emptyTimetable.save();
  console.log(`📅 מערכת שעות נוצרה לכיתה ${className}`);
}


async function autoAssignTeachersToTimetable(className) {
  const timetable = await Timetable.findOne({ className });
  if (!timetable) return;

  const allTeachers = await User.find({ role: "teacher", subject: { $ne: null } });

  for (const teacher of allTeachers) {
    const subject = teacher.subject;
    let assigned = 0;

    for (const day of days) {
      for (const slot of scheduleSlots) {
        const key = `${day}-${slot.start}`;

        // בדיקה אם המורה מלמד כבר בזמן הזה
        const clash = await Timetable.exists({
          "lessons.teacherId": teacher._id,
          "lessons.day": day,
          "lessons.startTime": slot.start
        });

        // בדיקה אם השעה תפוסה בכיתה הנוכחית
        const taken = timetable.lessons.some(
          (lesson) => lesson.day === day && lesson.startTime === slot.start
        );

        if (!clash && !taken) {
          timetable.lessons.push({
            day,
            startTime: slot.start,
            endTime: slot.end,
            subject,
            teacherId: teacher._id,
            className
          });

          assigned++;
          if (assigned === 2) break;
        }
      }

      if (assigned === 2) break;
    }
  }

  await timetable.save();
  console.log(`📘 שובצו מורים למערכת שעות של כיתה ${className}`);
}



module.exports = {
  addLesson,
  getLessonsByClass,
  deleteLesson,
  handleSubjectChanges,
  autoAssignTeachersToTimetable,
  createTimetable
};
