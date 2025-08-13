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

exports.addStudentToClass = async ({ classId, parentId, studentId, studentName }) => {
      const classObj = await Class.findById(classId);
      if (!classObj) throw new Error('כיתה לא נמצאה');
  
      // בדוק אם התלמיד כבר קיים בכיתה
      const existingStudent = classObj.students.find(s => s.studentId === studentId);
      if (existingStudent) {
        throw new Error('התלמיד כבר קיים בכיתה');
      }
  
      // הוסף לכיתה
      classObj.students.push({ parentId, studentId });
      await classObj.save();
      console.log('✅ תלמיד נוסף לכיתה בהצלחה');
  
      // עדכן את אובייקט התלמיד בקולקציית Students
      const student = await Student.findOne({ studentId });
      if (student) {
        student.classId = classId;
        await student.save();
        console.log('✅ אובייקט התלמיד עודכן בקולקציית Students');
      } else {
        console.log('⚠️ לא נמצא אובייקט תלמיד בקולקציית Students');
      }
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
    
    // קבל את כל התלמידים מקולקציית Students
    const allStudents = await Student.find().populate('parentIds', 'name email');
    console.log('👥 נמצאו סה"כ תלמידים:', allStudents.length);
    
    // קבל את כל הכיתות
    const classes = await Class.find();
    console.log('🏫 נמצאו סה"כ כיתות:', classes.length);
    
    // צור רשימה של כל התלמידים המשויכים לכיתות
    const assignedStudentIds = new Set();
    classes.forEach(classObj => {
      classObj.students.forEach(student => {
        assignedStudentIds.add(student.studentId);
      });
    });
    console.log('📋 תלמידים משויכים:', Array.from(assignedStudentIds));

    // סנן תלמידים שעדיין לא משויכים לכיתות
    const unassignedStudents = allStudents.filter(student => 
      !assignedStudentIds.has(student.studentId)
    );
    
    console.log('🆓 תלמידים לא משויכים:', unassignedStudents.length);
    console.log('📝 רשימת תלמידים לא משויכים:', unassignedStudents.map(s => s.name));

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
