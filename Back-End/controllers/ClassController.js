const Class = require('../models/Class');
const classService = require("../service/classService");
const User = require('../models/User');
const Student = require('../models/Student');

const createClass = async (req, res) => {
  try {
    const cls = await classService.createClass(req.body);
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const classes = await classService.getAllClasses();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getClassById = async (req, res) => {
  try {
    const cls = await classService.getClassById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const updatedClass = await classService.updateClass(req.params.id, req.body);
    if (!updatedClass) return res.status(404).json({ error: 'Class not found' });
    res.json(updatedClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const deletedClass = await classService.deleteClass(req.params.id);
    if (!deletedClass) return res.status(404).json({ error: 'Class not found' });
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ חדש - הוספת תלמיד לכיתה
const addStudentToClass = async (req, res) => {
  try {
    const { classId, parentId, studentId, studentName } = req.body;
    const classObj = await classService.addStudentToClass({ classId, parentId, studentId, studentName });
    res.status(200).json({ message: 'התלמיד נוסף לכיתה בהצלחה', class: classObj });
  } catch (error) {
    console.error('❌ שגיאה בהוספת תלמיד לכיתה:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ חדש - הסרת תלמיד מכיתה
const removeStudentFromClass = async (req, res) => {
  try {
    const { classId, studentId } = req.body;
    const classObj = await classService.removeStudentFromClass({ classId, studentId });
    res.status(200).json({ message: 'התלמיד הוסר מהכיתה בהצלחה', class: classObj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ חדש - קבלת כל התלמידים שעדיין לא משויכים לכיתות
const getUnassignedStudents = async (req, res) => {
  try {
    const unassignedStudents = await classService.getUnassignedStudents();
    res.status(200).json(unassignedStudents);
  } catch (error) {
    console.error('❌ שגיאה בקבלת תלמידים לא משויכים:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getUnassignedStudents
};
