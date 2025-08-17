const User = require("../models/User");
const Class = require("../models/Class");
const Student = require("../models/Student");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const emailService = require("./emailService");
const timetableService = require("./timetableService");

async function assignStudentToClass(grade, parentId, studentId) {
  // חפש את כיתת השכבה הקיימת הראשונה
  let classObj = await Class.findOne({ grade });

  if (!classObj) {
    // אם לא קיימת כיתה כלל לשכבה הזאת, צור אחת
    classObj = new Class({
      grade,
      students: [],
    });
  }

  // הוסף את התלמיד
  classObj.students.push({ parentId, studentId });
  await classObj.save();

  return classObj;
}

async function createUser(data) {
  console.log('🔧 Creating user with data:', {
    username: data.username,
    email: data.email,
    role: data.role,
    name: data.name
  });
  
  // נקה רווחים נוספים מהנתונים החשובים
  const cleanData = {
    ...data,
    username: data.username?.trim(),
    email: data.email?.trim(),
    name: data.name?.trim(),
  };
  
  const hashedPassword = await bcrypt.hash(cleanData.password, 10);
  console.log('🔐 Password hashed successfully');

  const newUser = new User({
    ...cleanData,
    password: hashedPassword
  });

  await newUser.save();
  console.log('✅ User created successfully:', {
    id: newUser._id,
    username: newUser.username,
    role: newUser.role
  });

  // ✅ אם זה הורה - צור גם אובייקט תלמיד
  if (newUser.role === "parent" && cleanData.studentName && cleanData.studentId) {
    console.log('👶 יוצר אובייקט תלמיד להורה');
    try {
      await createStudent({
        studentName: cleanData.studentName,
        studentId: cleanData.studentId,
        grade: cleanData.grade
      }, newUser._id);
      
    } catch (error) {
      console.error('❌ שגיאה ביצירת תלמיד:', error);
      // אל תעצור את התהליך - ההורה נוצר בהצלחה
    }
  }

  // יוצר TOKEN גם לאחר הרשמה מוצלחת
  const token = jwt.sign(
    { 
      id: newUser._id, 
      fullName: newUser.name, // השם המלא של המשתמש
      email: newUser.email,
      role: newUser.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    message: "הרשמה הצליחה",
    token,
    user: {
      id: newUser._id,
      fullName: newUser.name, // השם המלא של המשתמש
      studentName: newUser.studentName || "", // שם הילד (רק להורים)
      parentEmail: newUser.email, // אימייל המשתמש
      email: newUser.email, // גם בשדה email לתאימות
      role: newUser.role,
      subject: newUser.subject || "",
      studentId: newUser.studentId || "", // ת"ז הילד (רק להורים)
      grade: newUser.grade || "", // כיתת הילד (רק להורים)
      username: newUser.username
    }
  };
}




async function getAllUsers() {
  return await User.find();
}

 //עדכון פרטים
const updateUser = async (userId, updates) => {
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new Error("User not found");
  }

  const oldSubject = existingUser.subject || ""; // אם לא קיים
  const newSubject = updates.subject || "";
  console.log(newSubject);

  // בצע עדכון בפועל
  const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

  // החזרה רק של שדות חשובים (לא הסיסמה וכו')
  return {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    subject: updatedUser.subject || ""
  };
};

async function deleteUser(id) {
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw new Error("User not found");
  return { message: "User deleted successfully" };
}

async function login({ username, password, role }) {
  console.log(`🔍 Login attempt - Username: "${username}", Role: "${role}"`);
  console.log(`📏 Username length: ${username.length}, Password length: ${password.length}`);
  
  // נקה רווחים נוספים
  const cleanUsername = username.trim();
  
  const user = await User.findOne({ username: cleanUsername }); 
  console.log(`👤 User found: ${user ? `Yes (role: "${user.role}")` : 'No'}`);
  
  if (!user) {
    console.log('❌ User not found');
    console.log('💡 Available usernames in DB:');
    const allUsers = await User.find({}, 'username role');
    allUsers.forEach(u => console.log(`   - "${u.username}" (${u.role})`));
    throw new Error("שם משתמש או סיסמא שגויים");
  }
  
  const passwordMatch = await bcrypt.compare(password, user.password);
  console.log(`🔐 Password match: ${passwordMatch}`);
  
  const roleMatch = (user.role === role);

  console.log(`🎭 Role match: ${roleMatch} (user role: "${user.role}", requested: "${role}")`);
  
  if (!passwordMatch || !roleMatch) {
    console.log('❌ Password or role mismatch');
    throw new Error("שם משתמש או סיסמא שגויים");
  }

  //יוצר TOKEN עם כל הפרטים הנדרשים
  const token = jwt.sign(
    { 
      id: user._id, 
      fullName: user.name, // השם המלא של המשתמש
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  console.log('✅ Login successful');
  //מחבר את המשתמש
  return {
    message: "התחברות הצליחה",
    token,
    user: {
      id: user._id,
      fullName: user.name, // השם המלא של המשתמש
      studentName: user.studentName || "", // שם הילד (רק להורים)
      parentEmail: user.email, // אימייל המשתמש
      email: user.email, // גם בשדה email לתאימות
      role: user.role,
      subject: user.subject || "",
      studentId: user.studentId || "", // ת"ז הילד (רק להורים)
      grade: user.grade || "", // כיתת הילד (רק להורים)
      username: user.username
    }
  };

}

async function resetPassword({ username }) {
  const user = await User.findOne({ username });
  if (!user) throw new Error("משתמש לא נמצא");

  // 1. יצירת סיסמה חדשה
  const newPassword = crypto.randomBytes(3).toString("hex");
  
  // 2. הצפנה
  const hashed = await bcrypt.hash(newPassword, 10);

  // 3. שמירה במסד
  user.password = hashed;
  await user.save();

  //שליחת סיסמא במייל
  await emailService.sendPasswordResetEmail(user.email, newPassword);

  return { message: "סיסמה נשלחה למייל בהצלחה" };
}

// ✅ חדש - שיוך מורה לכיתה
async function assignTeacherToClass(teacherId, className) {
  const teacher = await User.findById(teacherId);
  if (!teacher) throw new Error("מורה לא נמצא");
  if (teacher.role !== 'teacher') throw new Error("המשתמש אינו מורה");

  // בדוק אם המורה כבר משויך לכיתה
  if (teacher.assignedClasses.includes(className)) {
    throw new Error("המורה כבר משויך לכיתה זו");
  }

  teacher.assignedClasses.push(className);
  await teacher.save();

  return { message: `המורה ${teacher.name} שויך לכיתה ${className} בהצלחה` };
}

// ✅ חדש - הסרת מורה מכיתה
async function removeTeacherFromClass(teacherId, className) {
  const teacher = await User.findById(teacherId);
  if (!teacher) throw new Error("מורה לא נמצא");

  teacher.assignedClasses = teacher.assignedClasses.filter(c => c !== className);
  await teacher.save();

  return { message: `המורה ${teacher.name} הוסר מכיתה ${className} בהצלחה` };
}

// ✅ חדש - קבלת כל המורים
async function getAllTeachers() {
  return await User.find({ role: 'teacher' }).select('-password');
}

// ✅ חדש - קבלת כל ההורים
async function getAllParents() {
  return await User.find({ role: 'parent' }).select('-password');
}

// ✅ חדש - יצירת אובייקט תלמיד
async function createStudent(studentData, parentId) {
  try {
    console.log('👶 יוצר תלמיד חדש:', studentData);
    
    // בדיקה אם התלמיד כבר קיים
    const existingStudent = await Student.findOne({ studentId: studentData.studentId });
    if (existingStudent) {
      console.log('⚠️ תלמיד כבר קיים:', existingStudent.name);
      // אם התלמיד קיים, רק נוסיף את ההורה לרשימת ההורים
      if (!existingStudent.parentIds.includes(parentId)) {
        existingStudent.parentIds.push(parentId);
        await existingStudent.save();
        console.log('✅ הורה נוסף לתלמיד קיים');
      }
      return existingStudent;
    }

    // יצירת תלמיד חדש
    const newStudent = new Student({
      name: studentData.studentName,
      studentId: studentData.studentId,
      grade: studentData.grade || null, // יכול להיות ללא כיתה בהתחלה
      parentIds: [parentId]
    });

    const savedStudent = await newStudent.save();
    console.log('✅ תלמיד נוצר בהצלחה:', savedStudent.name);
    
    return savedStudent;
  } catch (error) {
    console.error('❌ שגיאה ביצירת תלמיד:', error);
    throw new Error('לא ניתן ליצור אובייקט תלמיד: ' + error.message);
  }
}

// ✅ חדש - קבלת כל התלמידים
async function getAllStudents() {
  try {
    return await Student.find().populate('parentIds', 'name email').populate('classId', 'grade');
  } catch (error) {
    throw new Error('לא ניתן לשלוף תלמידים: ' + error.message);
  }
}
async function findById(id) {
  return await User.findById(id);
}

module.exports = {
  createUser,
  login,
  updateUser,
  deleteUser,
  getAllUsers,
  resetPassword,
  assignStudentToClass,
  assignTeacherToClass,
  removeTeacherFromClass,
  getAllTeachers,
  getAllParents,
  createStudent,
  findById,
  getAllStudents
};



  
