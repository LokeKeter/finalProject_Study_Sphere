const User = require("../models/User");
const Class = require("../models/Class");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const emailService = require("./emailService");

async function assignStudentToClass(grade, parentId, studentId) {
  // שלב 1: מצא את כל הכיתות באותה שכבה (למשל "ט")
  const classes = await Class.find({ grade }).sort({ classNumber: 1 });

  // שלב 2: חפש כיתה קיימת עם מקום פנוי
  for (const classObj of classes) {
    if (classObj.students.length < 25) {
      classObj.students.push({ parentId, studentId });
      await classObj.save();
      return classObj;
    }
  }

  // שלב 3: אם אין כיתה פנויה, צור כיתה חדשה
  const newClassNumber = classes.length + 1;
  const newClass = new Class({
    grade,
    classNumber: newClassNumber,
    students: [{ parentId, studentId }],
  });
  await newClass.save();
  return newClass;
}

async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
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

async function updateUser(id, data) {
  const updated = await User.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error("User not found");
  return updated;
}

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
      username: user.username,
      role: user.role
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