const User = require("../models/User");
const Class = require("../models/Class");
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




const { createTimetable } = require("./timetableService");

async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // ✅ צור כיתה אם אין
  if (data.grade && !(await Class.findOne({ grade: data.grade }))) {
    const newClass = new Class({ grade: data.grade, students: [] });
    await newClass.save();

    // ✅ צור מערכת שעות מלאה עם שיבוץ
    await createTimetable(data.grade);
  }

  const newUser = new User({
    ...data,
    password: hashedPassword
  });

  await newUser.save();

  if (newUser.role === "parent" && data.grade && data.studentId) {
    await assignStudentToClass(data.grade, newUser._id, data.studentId);
  }

  return newUser;
}




async function getAllUsers() {
  return await User.find();
}

async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found");
  return user;
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
  const user = await User.findOne({ username }); 
  if ( !user || !(await bcrypt.compare(password, user.password)) || (user.role !== role && user.role !== "admin") ) {
    throw new Error("שם משתמש או סיסמא שגויים");
  }

  //יוצר TOKEN
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  //מחבר את המשתמש
  return {
    message: "התחברות הצליחה",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subject: user.subject || ""
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

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  resetPassword,
  assignStudentToClass
};