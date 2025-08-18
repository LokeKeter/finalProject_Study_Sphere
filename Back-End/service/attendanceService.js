const Timetable = require("../models/Timetable");
const Class = require("../models/Class");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const HomeworkClass   = require("../models/HomeworkClass");
const Communication = require("../models/Communication");
const Student = require("../models/Student");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const DEBUG_ATTENDANCE = process.env.DEBUG_ATTENDANCE === '1';
const dlog = (...args) => { if (DEBUG_ATTENDANCE) console.log('[ATT]', ...args); };

const saveAttendance = async ({ date, className, subject, students, teacherId }) => {
  console.log("date: ", date);
  console.log("className: ", className);
  console.log("students: ", students);
  console.log("teacherId: ", teacherId);
  console.log("subject: ", subject);

  if (!date || !className || !students || !teacherId || !subject) {
    throw new Error("Missing required fields");
  }

  const rawDate = date;
  let dateObj = rawDate instanceof Date ? rawDate : parseDMYToDateLocal(rawDate);
  if (!dateObj) throw new Error("Invalid date format");

  dateObj.setHours(0,0,0,0);

  const newAttendance = new Attendance({
    date: dateObj,
    dateStr: typeof rawDate === 'string' ? rawDate : undefined,
    className,
    teacherId,
    subject,
    students
  });

  const savedAttendance = await newAttendance.save();

  // 1) מי שלא עשה שיעורי בית
  const homeworkMissed = students.filter(s => s.homework === false);
  console.log("תלמידים שלא עשו שיעורי בית:", homeworkMissed);

  // (קוסמטיקה קלה) אין צורך לשים teacherId פעמיים באובייקט החיפוש
  await HomeworkClass.updateMany(
    {
      classId  : className,
      teacherId: teacherId,
      subject  : subject,
      isCurrent: true
    },
    { $set: { isCurrent: false } }
  );

  // 🔁 מחליף את הבלוק הישן: מסנן בלי parentId
  const letters = homeworkMissed
    .filter(s => !!s.parentId) // רק אם יש parentId
    .map(s => ({
      type: "attend",
      senderId: teacherId,
      receiverId: s.parentId,
      subject: "לא עשה שיעורי בית",
      content: `התלמיד לא עשה שיעורי בית במקצוע "${subject}".`,
      createdAt: new Date()
    }));
  if (letters.length) {
    await Communication.insertMany(letters);
    console.log('✅ נשלחו מכתבים להורים (ש"ב):', letters.length);
  } else {
    console.log("ℹ️ אין למי לשלוח מכתבי ש\"ב (חסר parentId).");
  }

  // 2) נעדרים
  const absents = students.filter(s => s.attendance === false);

  // 🔁 מחליף את הבלוק הישן: מסנן בלי parentId
  const absentLetters = absents
    .filter(s => !!s.parentId) // רק אם יש parentId
    .map(s => ({
      type: "attend",
      senderId: teacherId,
      receiverId: s.parentId,
      subject: `לא נכח - ${subject}`,
      content: `התלמיד לא נכח בשיעור "${subject}".`,
      createdAt: new Date()
    }));
  if (absentLetters.length) {
    await Communication.insertMany(absentLetters);
    console.log("✅ נשלחו מכתבי היעדרות:", absentLetters.length);
  } else {
    console.log("ℹ️ אין למי לשלוח מכתבי היעדרות (חסר parentId).");
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
  const teacher = await User.findById(teacherId).select("assignedClasses").lean();
  if (!teacher || !Array.isArray(teacher.assignedClasses)) return [];
  return [...new Set(teacher.assignedClasses.map(String))];
};

// attendanceService.js
const getStudentsByClass = async ({ teacherId, grade }) => {
  try {
    console.log('🔍 getStudentsByClass called with:', { teacherId, grade });
    
    // מאשר שהמורה מלמד את הכיתה
    const teacher = await User.findById(teacherId).select('assignedClasses').lean();
    const assigned = (teacher?.assignedClasses || []).map(String);
    if (!assigned.includes(String(grade))) {
      console.log('❌ Teacher is not assigned to this class');
      return [];
    }

    // שליפת כיתה + הורה (וננסה להוציא כמה שדות שם)
    const classDoc = await Class.findOne({ grade })
      .populate('students.parentId', 'name firstName lastName')
      .lean();

    if (!classDoc) {
      console.log('❌ Class not found for grade:', grade);
      return [];
    }
    
    console.log('✅ Found class with grade:', grade, 'and students:', classDoc.students?.length || 0);
  

  const rawIds = (classDoc.students || []).map(s => s.studentId).filter(Boolean);

  // Helper function to check if a string looks like an ObjectId
  const isObjectIdLike = (id) => {
    if (!id) return false;
    const str = String(id).trim();
    return /^[0-9a-fA-F]{24}$/.test(str);
  };

  // מפריד לאובייקטים שנראים כמו ObjectId ולת"ז/מחרוזות
  const objectIds = [];
  const nationalIds = [];
  for (const id of rawIds) {
    if (isObjectIdLike(id)) objectIds.push(new mongoose.Types.ObjectId(id));
    else nationalIds.push(String(id));
  }

  // מביא תלמידים לפי _id וגם לפי studentId (אם קיים כזה שדה)
  const [byObjId, byNatId] = await Promise.all([
    objectIds.length
      ? Student.find({ _id: { $in: objectIds } })
          .select('_id studentId fullName firstName lastName name')
          .lean()
      : [],
    nationalIds.length
      ? Student.find({ studentId: { $in: nationalIds } })
          .select('_id studentId fullName firstName lastName name')
          .lean()
      : [],
  ]);

  // Helper function to extract full name from document
  const fullNameFromDoc = (doc) => {
    if (!doc) return null;
    if (doc.fullName) return doc.fullName;
    if (doc.name) return doc.name;
    if (doc.firstName && doc.lastName) return `${doc.firstName} ${doc.lastName}`;
    if (doc.firstName) return doc.firstName;
    if (doc.lastName) return doc.lastName;
    return null;
  };

  // בונה Map שמחזיק שם לפי גם _id וגם studentId
  const nameMap = new Map();
  const addToMap = (stu) => {
    const nm = fullNameFromDoc(stu);
    if (!nm) return;
    nameMap.set(String(stu._id), nm);
    if (stu.studentId != null) nameMap.set(String(stu.studentId), nm);
  };
  byObjId.forEach(addToMap);
  byNatId.forEach(addToMap);

  // Fetch all parent users for the students in this class
  const studentIds = classDoc.students.map(s => s.studentId).filter(Boolean);
  
  // Get all students with their parentIds
  const students = await Student.find({ _id: { $in: studentIds } })
    .select('_id name parentIds')
    .lean();
    
  console.log(`✅ Found ${students.length} students from Student collection`);
  
  // Create a map of student ID to parentIds
  const studentParentMap = new Map();
  for (const student of students) {
    studentParentMap.set(String(student._id), {
      name: student.name,
      parentIds: student.parentIds || []
    });
  }
  
  // Get all parent users for these students
  const allParentIds = students
    .flatMap(s => s.parentIds || [])
    .filter(Boolean)
    .map(id => String(id));
    
  console.log(`🔍 Looking up ${allParentIds.length} parent users`);
  
  // Fetch parent users
  const parentUsers = await User.find({ 
    _id: { $in: allParentIds },
    role: 'parent'
  })
  .select('_id name email')
  .lean();
  
  console.log(`✅ Found ${parentUsers.length} parent users`);
  
  // Create a map of parent ID to parent name
  const parentMap = new Map();
  for (const parent of parentUsers) {
    parentMap.set(String(parent._id), parent.name || 'הורה');
  }
  
  // Array to collect student IDs that need parent ID updates
  const studentIdsToUpdate = [];
  
  // מיפוי התוצאה ל־frontend
  const result = (classDoc.students || []).map(s => {
    if (!s || !s.studentId) {
      console.log('⚠️ Invalid student entry in class:', s);
      return null;
    }
    
    const studentInfo = studentParentMap.get(String(s.studentId));
    
    // Get parent ID directly from student record in class or from the student's parentIds
    let parentId = s.parentId || null;
    
    // If no parentId in class record but we have parentIds in student record
    if (!parentId && studentInfo && studentInfo.parentIds && studentInfo.parentIds.length > 0) {
      parentId = studentInfo.parentIds[0];
      
      // Schedule an update to the class record
      studentIdsToUpdate.push({
        classId: classDoc._id,
        studentId: s.studentId,
        parentId: parentId
      });
    }
    
    // Get parent name from the parent map or use stored name
    let parentName = s.parentName || 'לא ידוע';
    
    // If we have a parentId and it's in our parent map, use that name
    if (parentId && parentMap.has(String(parentId))) {
      parentName = parentMap.get(String(parentId));
    }
    
    // If parentId is missing, try to find it from Student model
    if (!parentId) {
      console.log(`⚠️ No parentId in class record for student: ${s.studentId}, checking Student model`);
      
      // We'll handle this asynchronously after mapping all students
      studentIdsToUpdate.push({
        classId: classDoc._id,
        studentId: s.studentId
      });
    } else if (parentId && typeof parentId === 'object' && parentId._id) {
      // If parentId is populated object, use its _id
      console.log(`✅ Found populated parentId: ${parentId._id}`);
      parentId = parentId._id;
    }
    
    // שם התלמיד - use stored studentName, student info, or nameMap
    let studentName = s.studentName || null;
    
    // If no studentName in class record but we have it in studentInfo
    if (!studentName && studentInfo && studentInfo.name) {
      studentName = studentInfo.name;
    }
    
    // If still no name, try to get from nameMap
    if (!studentName) {
      const sid = s.studentId;
      studentName = nameMap.get(String(sid));
      if (!studentName && isObjectIdLike(sid)) {
        studentName = nameMap.get(String(new mongoose.Types.ObjectId(sid)));
      }
    }

    const result = {
      parentId: parentId && typeof parentId === 'object' ? parentId._id : parentId,
      parentName: parentName || 'לא ידוע',
      studentName: studentName || 'לא ידוע',
    };
    
    console.log(`📊 Mapped student: ${result.studentName}, parent: ${result.parentName}, parentId: ${result.parentId}`);
    return result;
  }).filter(Boolean); // Remove null entries
  
  console.log(`✅ Returning ${result.length} students`);
  
  // If there are students that need parent ID updates, do it asynchronously
  if (studentIdsToUpdate.length > 0) {
    console.log(`🔄 Scheduling updates for ${studentIdsToUpdate.length} student parent IDs`);
    
    // Use setTimeout to run this asynchronously after the response is sent
    setTimeout(async () => {
      try {
        for (const item of studentIdsToUpdate) {
          try {
            // We already have the parentId from the studentParentMap
            if (item.parentId) {
              console.log(`✅ Updating class record with parentId: ${item.parentId} for student: ${item.studentId}`);
              
              // Also get the parent name
              const parentUser = await User.findById(item.parentId).select('name').lean();
              const parentName = parentUser?.name || 'הורה';
              
              // Update the class record with this parent ID and name for future use
              await Class.updateOne(
                { _id: item.classId, "students.studentId": item.studentId },
                { 
                  $set: { 
                    "students.$.parentId": item.parentId,
                    "students.$.parentName": parentName
                  } 
                }
              );
              console.log(`✅ Updated class record with parentId and parentName: ${parentName}`);
            } else {
              console.log(`⚠️ No parentId found for student: ${item.studentId}`);
            }
          } catch (error) {
            console.error(`❌ Error updating parent ID for student ${item.studentId}:`, error);
          }
        }
      } catch (error) {
        console.error('❌ Error in async parent ID updates:', error);
      }
    }, 0);
  }
  
  return result;
  } catch (error) {
    console.error('❌ Error in getStudentsByClass:', error);
    return [];
  }
};

const getClassesForTeacher = async (teacherId) => {
  const timetables = await Timetable.find({ "lessons.teacherId": teacherId });

  // מחלץ רק את שמות הכיתות הייחודיים
  const classNames = timetables.map(t => t.className);
  return [...new Set(classNames)];
};

function parseDMYToDateLocal(s) {
  if (!s) return null;
  const str = String(s).trim();
  const [datePart] = str.split(/\s+/);
  const [dd, mm, yyyy] = (datePart || '').split(/[./-]/).map(n => parseInt(n, 10));
  if (!dd || !mm || !yyyy) {
    dlog('parseDMYToDateLocal: failed to parse', { input: s });
    return null;
  }
  const d = new Date(yyyy, (mm - 1), dd, 0, 0, 0, 0); // חצות מקומי
  return d;
}

const getAttendanceByClassAndDate = async (className, dateStr) => {
  const d = parseDMYToDateLocal(dateStr);
  if (!d) return [];
  const start = new Date(d); start.setHours(0,0,0,0);
  const end   = new Date(d); end.setHours(23,59,59,999);

  return Attendance.find({
    className,
    date: { $gte: start, $lte: end }
  }).lean();
};

const getSummary = async ({ teacherId, days = 7 } = {}) => {
  // חלון [start, end) – עד מחר בחצות כדי לכלול את היום הנוכחי
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);

  const start = new Date(end);
  start.setDate(end.getDate() - days);

  const teacherFilter = teacherId
    ? {
        teacherId: mongoose.Types.ObjectId.isValid(teacherId)
          ? new mongoose.Types.ObjectId(teacherId)
          : teacherId
      }
    : {};

  const matchStage = { ...teacherFilter, createdAt: { $gte: start, $lt: end } };

  const rows = await Attendance.aggregate([
    { $match: matchStage },
    { $unwind: "$students" },
    {
      $group: {
        _id: null,
        present: { $sum: { $cond: [{ $eq: ["$students.attendance", true] }, 1, 0] } },
        absent:  { $sum: { $cond: [{ $eq: ["$students.attendance", false] }, 1, 0] } }
      }
    },
    { $project: { _id: 0, present: 1, absent: 1, total: { $add: ["$present", "$absent"] } } }
  ]);

  if (!rows.length) return { present: 0, absent: 0, total: 0 };
  return rows[0];
};

function parentIdFromToken(token) {
  if (!token) {
    const err = new Error('token is required');
    err.status = 400;
    throw err;
  }
  const raw = String(token).replace(/^Bearer\s+/i, '');
  let decoded;
  try {
    decoded = jwt.verify(raw, process.env.JWT_SECRET);
  } catch {
    const err = new Error('invalid token');
    err.status = 401;
    throw err;
  }
  const parentId = decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;
  if (!parentId) {
    const err = new Error('parent id not found in token');
    err.status = 401;
    throw err;
  }
  return parentId;
}

// ניסיון חביב להוציא שם מקצוע מההודעה (כדי לבנות טקסט יפה)
function inferSubject(comm) {
  // "לא נכח - ספורט"
  if (comm?.subject && comm.subject.startsWith('לא נכח - ')) {
    return comm.subject.replace('לא נכח - ', '').trim();
  }
  // התלמיד לא עשה שיעורי בית במקצוע "ספורט".
  const m = /"([^"]+)"/.exec(comm?.content || '');
  if (m) return m[1].trim();
  return comm?.meta?.subject || comm?.subjectName || '';
}

async function getParentDisciplineByToken(token, days = 7) {
  if (!token) {
    const err = new Error('token is required');
    err.status = 400;
    throw err;
  }

  // תמיכה ב"Bearer ..."
  const raw = String(token).replace(/^Bearer\s+/i, '');

  // מפענח טוקן => מזהה הורה
  let decoded;
  try {
    decoded = jwt.verify(raw, process.env.JWT_SECRET);
  } catch (e) {
    const err = new Error('invalid token');
    err.status = 401;
    throw err;
  }

  const parentId =
    decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;
  if (!parentId) {
    const err = new Error('parent id not found in token');
    err.status = 401;
    throw err;
  }

  // חלון זמן – ברירת מחדל: שבוע אחורה (כולל היום)
  const since = new Date();
  since.setDate(since.getDate() - (Number(days) || 7));
  since.setHours(0, 0, 0, 0);

  // המרה ל־ObjectId אם רלוונטי
  const pid = mongoose.Types.ObjectId.isValid(parentId)
    ? new mongoose.Types.ObjectId(parentId)
    : parentId;

  // שליפה מ-COMMUNICATION: רק type=attend, המקבל הוא ההורה, ובשבוע האחרון
  const rows = await Communication.find(
    {
      type: 'attend',
      receiverId: pid,
      createdAt: { $gte: since },
    },
    {
      subject: 1,
      content: 1,
      createdAt: 1,
    }
  )
  .sort({ createdAt: -1 })
  .limit(500) // מגן – אפשר לשנות/להסיר
  .lean();

  // בנורמליזציה נבנה כותרת "לא נכח ב{מקצוע}" או "לא הכין שיעורי בית • {מקצוע}"
  const items = [];
  for (const r of rows) {
    const subjRaw = String(r.subject || '');
    const content = String(r.content || '');

    // ננסה לשלוף את שם המקצוע
    let subjectName = null;

    // 1) "לא נכח - {מקצוע}"
    const mAbs = subjRaw.match(/^לא\s*נכח\s*-\s*(.+)$/);
    if (mAbs) subjectName = mAbs[1].trim();

    // 2) מתוך התוכן (לש"ב): התלמיד לא עשה שיעורי בית במקצוע "{מקצוע}".
    if (!subjectName) {
      const mHw = content.match(/במקצוע\s+"([^"]+)"/);
      if (mHw) subjectName = mHw[1].trim();
    }

    // זיהוי סוג
    const isAbs  = /^לא\s*נכח/i.test(subjRaw) || /לא\s*נכח/i.test(content);
    const isHw   = /שיעורי\s*בית|ש"ב/i.test(subjRaw) || /שיעורי\s*בית|ש"ב/i.test(content);

    let title;
    if (isAbs) {
      title = `לא נכח ב${subjectName || ''}`.trim();
    } else if (isHw) {
      title = `לא הכין שיעורי בית • ${subjectName || ''}`.replace(/\s•\s$/, '').trim();
    } else {
      // fallback
      title = subjRaw || 'אירוע';
    }

    items.push({
      id: String(r._id),
      title,
      date: r.createdAt, // תאריך התרחשות/שליחה
    });
  }

  return items;
}

function getParentIdFromToken(token) {
  if (!token) {
    const err = new Error('token is required');
    err.status = 400;
    throw err;
  }
  const raw = String(token).replace(/^Bearer\s+/i, '');
  let decoded;
  try {
    decoded = jwt.verify(raw, process.env.JWT_SECRET);
  } catch {
    const err = new Error('invalid token');
    err.status = 401;
    throw err;
  }
  const parentId = decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;
  if (!parentId) {
    const err = new Error('parent id not found in token');
    err.status = 401;
    throw err;
  }
  return parentId;
}

function sinceForRange(range = 'weekly') {
  const now = new Date();
  const since = new Date(now);
  switch (String(range).toLowerCase()) {
    case 'daily':
    case 'day':
      since.setHours(0, 0, 0, 0);
      return since;
    case 'weekly':
    case 'week':
      since.setDate(now.getDate() - 7);
      since.setHours(0, 0, 0, 0);
      return since;
    case 'monthly':
    case 'month':
      since.setMonth(now.getMonth() - 1);
      since.setHours(0, 0, 0, 0);
      return since;
    case 'semester':
    case 'semesterly':
    case 'sem':
      since.setMonth(now.getMonth() - 4);
      since.setHours(0, 0, 0, 0);
      return since;
    case 'yearly':
    case 'year':
      since.setFullYear(now.getFullYear() - 1);
      since.setHours(0, 0, 0, 0);
      return since;
    default:
      since.setDate(now.getDate() - 7);
      since.setHours(0, 0, 0, 0);
      return since;
  }
}
const parentPieByToken = async ({ token, range = 'weekly' } = {}) => {
  const parentId = getParentIdFromToken(token);
  const since = sinceForRange(range);

  const pidObj = mongoose.Types.ObjectId.isValid(parentId)
    ? new mongoose.Types.ObjectId(parentId)
    : null;

  const matchParent = pidObj
    ? { $or: [{ "students.parentId": pidObj }, { "students.parentId": String(parentId) }] }
    : { "students.parentId": String(parentId) };

  const agg = await Attendance.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $unwind: "$students" },
    { $match: matchParent },
    {
      $group: {
        _id: null,
        present: {
          $sum: {
            $cond: [{ $eq: ["$students.attendance", true] }, 1, 0]
          }
        },
        absent: {
          $sum: {
            $cond: [{ $eq: ["$students.attendance", false] }, 1, 0]
          }
        },
      }
    }
  ]);

  const row = agg[0] || { present: 0, absent: 0 };
  return { present: row.present || 0, absent: row.absent || 0, since };
};

module.exports = {
  getAttendanceByClassAndDate,
  getTeacherClasses,
  getTeacherSubject,
  getSummary,
  getStudentsByClass,
  saveAttendance,
  getParentDisciplineByToken,
  getParentIdFromToken,
  getClassesForTeacher,
  parentPieByToken
};
