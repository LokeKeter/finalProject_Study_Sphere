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
  console.log('🧹 removeStudentFromClass | params:', {
    classId,
    studentId,
    studentId_type: typeof studentId,
  });

  const classObj = await Class.findById(classId);
  if (!classObj) {
    console.error('❌ כיתה לא נמצאה:', classId);
    throw new Error('כיתה לא נמצאה');
  }

  console.log('📦 לפני הסרה מהכיתה:', {
    classGrade: classObj.grade,
    studentsCount: (classObj.students || []).length,
    studentsIds: (classObj.students || []).map(s => String(s.studentId)),
  });

  const beforeCount = (classObj.students || []).length;
  classObj.students = (classObj.students || []).filter(
    s => String(s.studentId) !== String(studentId)
  );
  const afterCount = classObj.students.length;

  console.log('➖ תוצאת הסרה:', {
    beforeCount,
    afterCount,
    removed: beforeCount - afterCount,
  });

  await classObj.save();
  console.log('💾 הכיתה נשמרה בהצלחה');

  // חיפוש התלמיד גם כמחרוזת וגם כמספר (למקרה שטיפוס שונה במסד)
  let student = await Student.findOne({ studentId: String(studentId) });
  if (!student) {
    try {
      student = await Student.findOne({ studentId: Number(studentId) });
    } catch {
      /* מתעלמים */
    }
  }

  console.log('🔎 תוצאת חיפוש תלמיד:', {
    found: !!student,
    queryTried: [String(studentId), Number(studentId)],
  });

  if (student) {
    const gsrc = String(student.grade || classObj?.grade || '');
    const onlyLetters = gsrc.replace(/[^A-Za-z\u0590-\u05FF]/g, '');
    const firstLetter = onlyLetters.charAt(0) || '';

    console.log('🧪 חישוב שכבה:', {
      originalStudentGrade: student.grade,
      classGradeFallback: classObj?.grade,
      sourceUsed: gsrc,
      onlyLetters,
      firstLetter,
    });

    student.classId = null;
    student.grade = firstLetter;

    await student.save();
    console.log('✅ תלמיד עודכן ונשמר:', {
      studentMongoId: student._id,
      studentId: student.studentId,
      newGrade: student.grade,
      newClassId: student.classId,
    });
  } else {
    console.warn('⚠️ תלמיד לא נמצא עבור studentId:', studentId);
  }

  return classObj;
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



