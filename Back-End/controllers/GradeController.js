const Grade = require('../models/Grade');

// יצירת ציון חדש
const createGrade = async (req, res) => {
  try {
    const newGrade = new Grade(req.body);
    await newGrade.save();
    res.status(201).json(newGrade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// שליפת כל הציונים
const getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find();
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// שליפה לפי מזהה
const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) return res.status(404).json({ error: 'Grade not found' });
    res.json(grade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// עדכון ציון
const updateGrade = async (req, res) => {
  try {
    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedGrade) return res.status(404).json({ error: 'Grade not found' });
    res.json(updatedGrade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// מחיקת ציון
const deleteGrade = async (req, res) => {
  try {
    const deletedGrade = await Grade.findByIdAndDelete(req.params.id);
    if (!deletedGrade) return res.status(404).json({ error: 'Grade not found' });
    res.json({ message: 'Grade deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade
};
