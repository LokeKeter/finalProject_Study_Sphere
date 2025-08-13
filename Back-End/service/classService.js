const HomeworkClass = require("../models/HomeworkClass");
const User = require("../models/User");
const Class = require("../models/Class");
const Student = require("../models/Student");

exports.createClass = async ({ grade }) => {
  // grade מגיע כאות בסיס: "א"|"ב"|...|"יב"
  const base = String(grade || '').trim();
  if (!base) throw new Error('grade is required');

  // חפש כיתות קיימות שמתחילות באותה אות (כולל כאלה בלי מספר)
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existing = await Class.find({ grade: new RegExp(`^${esc}\\d*$`) })
                              .select('grade')
                              .lean();

  // מספור תפוס (כיתה "ג" בלי מספר נספרת כ-1)
  const used = new Set(
    existing.map(c => {
      const suffix = c.grade.slice(base.length); // "" | "2" | "10"...
      if (suffix === '') return 1;
      const n = parseInt(suffix, 10);
      return Number.isNaN(n) ? 1 : n;
    })
  );

  // מצא את המספר הפנוי הקטן ביותר
  let i = 1;
  while (used.has(i)) i++;

  const newGrade = `${base}${i}`;
  const newClass = new Class({ grade: newGrade, students: [] });
  return newClass.save();
};

exports.getAllClasses = () => Class.find();

exports.getClassById = (id) => Class.findById(id);

exports.updateClass = (id, updates) =>
  Class.findByIdAndUpdate(id, updates, { new: true });

exports.deleteClass = (id) => Class.findByIdAndDelete(id);

exports.addStudentToClass = async ({ classId, studentId }) => {
  const classObj = await Class.findById(classId);
  if (!classObj) throw new Error('כיתה לא נמצאה');

  // כבר יש תלמיד זה בכיתה?
  if (classObj.students.some(s => String(s.studentId) === String(studentId))) {
    throw new Error('התלמיד כבר קיים בכיתה');
  }

  // ✅ שליפה נכונה: מעבירים את ה-ObjectId עצמו, לא אובייקט
  // ❌ BUG שהיה גורם לשגיאה: Student.findById({ studentId })
  const studentDoc = await Student.findById(studentId).select('parentIds');
  if (!studentDoc) throw new Error('תלמיד לא נמצא');
  const parentUserId = studentDoc.parentIds?.[0];
  if (!parentUserId) throw new Error('לא נמצא הורה לתלמיד');

  // דחיפה נכונה: studentId = ObjectId של Student
  classObj.students.push({ parentId: parentUserId, studentId });
  await classObj.save();

  // עדכון סטודנט לפי ה-_id (לא לפי שדה studentId=ת"ז)
  await Student.updateOne(
    { _id: studentId },
    { classId: classObj._id, grade: classObj.grade }
  );

  return classObj;
};

exports.removeStudentFromClass = async ({ classId, studentId }) => {
  const classObj = await Class.findById(classId);
  if (!classObj) throw new Error('כיתה לא נמצאה');   // ❌ בלי res כאן

  classObj.students = classObj.students.filter(s => String(s.studentId) !== String(studentId));
  await classObj.save();

  const student = await Student.findOne({ studentId });
  if (student) {
    student.classId = null;
    await student.save();
  }

  return classObj; // ✅ זה מה שמחזירים מה-service
};

exports.getUnassignedStudents = async () => {
  console.log('🔍 מחפש תלמידים לא משויכים...');

  const allStudents = await Student.find().populate('parentIds', 'name email');
  console.log('👥 נמצאו סה"כ תלמידים:', allStudents.length);

  const classes = await Class.find();
  console.log('🏫 נמצאו סה"כ כיתות:', classes.length);

  // מזהים משויכים לפי ObjectId של Student שנשמר בכיתה
  const assignedStudentIds = new Set();
  classes.forEach(classObj => {
    classObj.students.forEach(s => {
      if (s.studentId) assignedStudentIds.add(String(s.studentId)); // ObjectId -> string
    });
  });

  // מסננים לפי _id של הסטודנט (ObjectId)
  const unassignedStudents = allStudents.filter(stu => 
    !assignedStudentIds.has(String(stu._id))
  );

  console.log('🆓 תלמידים לא משויכים:', unassignedStudents.length);
  return unassignedStudents;
};


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
