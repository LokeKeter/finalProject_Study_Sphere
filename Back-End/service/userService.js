const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const newUser = new User({
    ...data,
    password: hashedPassword
  });
  await newUser.save();
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
  console.log("🟡 UserService.login - start", { username, role });
  const user = await User.findOne({ username });
  console.log("🟡 UserService.login - found user?", !!user);
  if (!user) throw new Error("❌ משתמש לא נמצא");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("❌ סיסמה שגויה");

  if (user.role !== role) throw new Error("⚠️ תפקיד לא תואם למשתמש");

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
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "איפוס סיסמה - StudySphere",
    text: `הסיסמה החדשה שלך היא: >>${newPassword}<<`
  });

  return { message: "סיסמה נשלחה למייל בהצלחה" };
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  resetPassword
};