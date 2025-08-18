const userService = require("../service/userService");
const sanitize = require('../utils/sanitizeInput');
const logger = require('../utils/logger');
const { validationResult } = require("express-validator");
const Timetable = require("../models/Timetable");

const register = async (req, res) => {
  try {
    console.log('📥 Register request received with body:', req.body);
    
    // בדיקת שגיאות validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorArray = errors.array();
      console.log('❌ Validation errors:', errorArray);
      logger.warn(`Register validation failed: ${errorArray.map(e => `${e.param}: ${e.msg}`).join(", ")}`);
      return res.status(400).json({ errors: errorArray });
    }
    
    logger.info(`Register attempt: ${req.body.username}`);
    const sanitizedBody = sanitize(req.body);
    console.log('🧼 Sanitized body:', sanitizedBody);
    const result = await userService.createUser(sanitizedBody);
    logger.info(`Register success: ${result.username}`);
    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Register error:', err);
    logger.error(`Register failed for ${req.body.username}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    logger.info(`Login attempt: ${req.body.username}`);
    const sanitizedBody = sanitize(req.body);
    const result = await userService.login(sanitizedBody);
    logger.info(`Login success: ${result.user.username}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`Login failed for ${req.body.username}: ${err.message}`);
    res.status(401).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    logger.info(`Password reset requested for: ${req.body.username}`);
    const sanitizedBody = sanitize(req.body);
    const result = await userService.resetPassword(sanitizedBody);
    logger.info(`Password reset success for: ${req.body.username}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`Password reset failed for ${req.body.username}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ פונקציית עדכון פרטי משתמש
const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error("שגיאה בעדכון משתמש:", error);
    res.status(500).json({ error: "Server error during user update" });
  }
};

const deleteUser = async (req, res) => {
  try {
    console.log('🎯 Controller: deleteUser called with id:', req.params.id);
    await userService.deleteUser(req.params.id);
    console.log('✅ Controller: User deletion successful, sending 204');
    res.status(204).send();
  } catch (err) {
    console.error('❌ Controller: Delete user error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// ✅ חדש - שיוך מורה לכיתה
const assignTeacherToClass = async (req, res) => {
  try {
    const { teacherId, className } = req.body;
    const result = await userService.assignTeacherToClass(teacherId, className);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`Teacher assignment failed: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// ✅ חדש - הסרת מורה מכיתה
const removeTeacherFromClass = async (req, res) => {
  try {
    const { teacherId, className } = req.body;
    const result = await userService.removeTeacherFromClass(teacherId, className);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`Teacher removal failed: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// ✅ חדש - קבלת כל המורים
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await userService.getAllTeachers();
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ חדש - קבלת כל ההורים
const getAllParents = async (req, res) => {
  try {
    const parents = await userService.getAllParents();
    res.status(200).json(parents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ חדש - קבלת כל התלמידים
const getAllStudents = async (req, res) => {
  try {
    const students = await userService.getAllStudents();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ חדש - שליפת כיתות של מורה מחובר
const getMyClasses = async (req, res) => {
  console.log("📩 הגיעו ל-getMyClasses, req.user =", req.user);

  try {
    const userId = req.user.id;
    const user = await userService.findById(userId); // ודא ש-userService.findById קיים

    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: "גישה נדחתה - המשתמש אינו מורה" });
    }

    res.json({ assignedClasses: user.assignedClasses || [] });
  } catch (err) {
    console.error('❌ שגיאה בשליפת כיתות של המורה:', err.message);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
};


// Create a parent for a student
const createParentForStudent = async (req, res) => {
  try {
    const { studentName, studentId } = req.body;
    
    if (!studentName) {
      return res.status(400).json({ message: "שם תלמיד נדרש" });
    }
    
    console.log('📝 Creating parent for student:', { studentName, studentId });
    
    const result = await userService.createParentForStudent(studentName, studentId);
    
    res.status(201).json({
      message: "חשבון הורה נוצר בהצלחה",
      parentId: result.parentId,
      parentName: result.parentName
    });
    
  } catch (error) {
    console.error('❌ Error creating parent for student:', error);
    res.status(500).json({ message: "שגיאה ביצירת חשבון הורה", error: error.message });
  }
};

const updateMe = async (req, res) => {
  try {
    const { fullName, email, studentName } = req.body || {};
    const payload = await userService.updateProfile({
      userId: req.user.id,
      role: req.user.role,
      fullName,
      email,
      studentName
    });
    return res.json(payload); // { message, user, token }
  } catch (e) {
    console.error('updateMe error:', e);
    return res.status(e.status || 500).json({ message: e.message || 'Server error' });
  }
};

module.exports = { 
  register, 
  login, 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  resetPassword,
  assignTeacherToClass,
  removeTeacherFromClass,
  getAllTeachers,
  getAllParents,
  getAllStudents,
  getMyClasses,
  createParentForStudent,
  updateMe
};