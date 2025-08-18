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
  console.log('📝 Adding student to class:', { classId, studentId });
  
  // Validate class exists
  const classObj = await Class.findById(classId);
  if (!classObj) {
    console.error('❌ Class not found:', classId);
    throw new Error('כיתה לא נמצאה');
  }

  // Check if student already exists in class
  if (classObj.students.some(s => String(s.studentId) === String(studentId))) {
    console.error('❌ Student already in class:', studentId);
    throw new Error('התלמיד כבר קיים בכיתה');
  }

  // Get student document with parent info
  const studentDoc = await Student.findById(studentId).select('parentIds name');
  if (!studentDoc) {
    console.error('❌ Student not found:', studentId);
    throw new Error('תלמיד לא נמצא');
  }
  
  // Get parent info or create one if missing
  let parentUserId = studentDoc.parentIds?.[0];
  let parentUser;
  let parentName;
  
  if (!parentUserId) {
    console.log('⚠️ No parent found for student, creating one automatically');
    
    try {
      // Create a new parent user automatically
      parentUser = await User.create({
        name: `הורה של ${studentDoc.name}`,
        email: `parent_${studentDoc._id}@studysphere.com`,
        username: `parent_${Date.now()}`,
        password: 'password123', // Default password
        role: 'parent',
        studentName: studentDoc.name
      });
      
      parentUserId = parentUser._id;
      parentName = parentUser.name;
      
      // Update student with new parent ID
      await Student.findByIdAndUpdate(
        studentId,
        { $push: { parentIds: parentUserId } }
      );
      
      console.log('✅ Created new parent user:', parentName, 'with ID:', parentUserId);
      
    } catch (error) {
      console.error('❌ Failed to create parent user:', error);
      throw new Error('יצירת משתמש הורה נכשלה');
    }
  } else {
    // Get parent name for better display
    parentUser = await User.findById(parentUserId).select('name');
    parentName = parentUser?.name || 'הורה';
  }
  
  console.log('✅ Found student and parent:', { 
    studentId, 
    studentName: studentDoc.name,
    parentId: parentUserId,
    parentName
  });

  // Add student to class with parent info
  classObj.students.push({ 
    parentId: parentUserId, 
    studentId,
    studentName: studentDoc.name, // Store student name for reference
    parentName: parentName // Store parent name for reference
  });
  
  await classObj.save();

  // Update student record with class info
  await Student.updateOne(
    { _id: studentId },
    { 
      classId: classObj._id, 
      grade: classObj.grade,
      // Ensure parent is linked
      $addToSet: { parentIds: parentUserId }
    }
  );

  console.log('✅ Student added to class successfully');
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

  // חיפוש התלמיד לפי ObjectId (המועבר מהכיתה)
  let student = await Student.findById(studentId);

  console.log('🔎 תוצאת חיפוש תלמיד:', {
    found: !!student,
    studentId: studentId,
    studentFound: student ? {
      _id: student._id,
      studentId: student.studentId,
      currentGrade: student.grade
    } : null,
  });

  if (student) {
    const gsrc = String(student.grade || classObj?.grade || '');
    const onlyLetters = gsrc.replace(/[^A-Za-z\u0590-\u05FF]/g, '');
    const firstLetter = onlyLetters.charAt(0) || '';

    console.log('🧪 מעדכן תלמיד שהוסר מכיתה:', {
      originalStudentGrade: student.grade,
      classGrade: classObj?.grade,
      sourceUsed: gsrc,
      onlyLetters,
      firstLetter,
      action: 'Setting grade to base letter only (removing class number)'
    });

    student.classId = null;
    student.grade = firstLetter; // מעדכן לאות הבסיס בלבד (ללא מספר כיתה)

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



