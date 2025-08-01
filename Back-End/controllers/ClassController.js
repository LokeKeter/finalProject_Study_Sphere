const Class = require('../models/Class');
const classService = require("../service/classService");
const User = require('../models/User');

const createClass = async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) return res.status(404).json({ error: 'Class not found' });
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClass) return res.status(404).json({ error: 'Class not found' });
    res.json(updatedClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ error: 'Class not found' });
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendClassHomework = async (req, res) => {
  try {
    const { classId, teacherId, subject, content } = req.body;
    const result = await classService.sendHomeworkToClass({ classId, teacherId, subject, content });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "שליחת שיעורי בית נכשלה", error: error.message });
  }
};

// ✅ חדש - הוספת תלמיד לכיתה
const addStudentToClass = async (req, res) => {
  try {
    console.log('➕ מוסיף תלמיד לכיתה:', req.body);
    const { classId, parentId, studentId, studentName } = req.body;
    
    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ error: 'כיתה לא נמצאה' });

    // בדוק אם התלמיד כבר קיים בכיתה
    const existingStudent = classObj.students.find(s => s.studentId === studentId);
    if (existingStudent) {
      return res.status(400).json({ error: 'התלמיד כבר קיים בכיתה' });
    }

    // הוסף לכיתה
    classObj.students.push({ parentId, studentId });
    await classObj.save();
    console.log('✅ תלמיד נוסף לכיתה בהצלחה');

    // עדכן את אובייקט התלמיד בקולקציית Students
    const Student = require('../models/Student');
    const student = await Student.findOne({ studentId });
    if (student) {
      student.classId = classId;
      student.grade = classObj.grade;
      await student.save();
      console.log('✅ אובייקט התלמיד עודכן בקולקציית Students');
    } else {
      console.log('⚠️ לא נמצא אובייקט תלמיד בקולקציית Students');
    }

    res.status(200).json({ message: 'התלמיד נוסף לכיתה בהצלחה', class: classObj });
  } catch (error) {
    console.error('❌ שגיאה בהוספת תלמיד לכיתה:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ חדש - הסרת תלמיד מכיתה
const removeStudentFromClass = async (req, res) => {
  try {
    console.log('➖ מסיר תלמיד מכיתה:', req.body);
    const { classId, studentId } = req.body;
    
    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ error: 'כיתה לא נמצאה' });

    // הסר מהכיתה
    classObj.students = classObj.students.filter(s => s.studentId !== studentId);
    await classObj.save();
    console.log('✅ תלמיד הוסר מהכיתה בהצלחה');

    // עדכן את אובייקט התלמיד בקולקציית Students
    const Student = require('../models/Student');
    const student = await Student.findOne({ studentId });
    if (student) {
      student.classId = null;
      student.grade = null;
      await student.save();
      console.log('✅ אובייקט התלמיד עודכן בקולקציית Students (הוסר מכיתה)');
    } else {
      console.log('⚠️ לא נמצא אובייקט תלמיד בקולקציית Students');
    }

    res.status(200).json({ message: 'התלמיד הוסר מהכיתה בהצלחה', class: classObj });
  } catch (error) {
    console.error('❌ שגיאה בהסרת תלמיד מכיתה:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ חדש - קבלת כל התלמידים שעדיין לא משויכים לכיתות
const getUnassignedStudents = async (req, res) => {
  try {
    console.log('🔍 מחפש תלמידים לא משויכים...');
    
    // קבל את כל התלמידים מקולקציית Students
    const Student = require('../models/Student');
    const allStudents = await Student.find().populate('parentIds', 'name email');
    console.log('👥 נמצאו סה"כ תלמידים:', allStudents.length);
    
    // קבל את כל הכיתות
    const classes = await Class.find();
    console.log('🏫 נמצאו סה"כ כיתות:', classes.length);
    
    // צור רשימה של כל התלמידים המשויכים לכיתות
    const assignedStudentIds = new Set();
    classes.forEach(classObj => {
      classObj.students.forEach(student => {
        assignedStudentIds.add(student.studentId);
      });
    });
    console.log('📋 תלמידים משויכים:', Array.from(assignedStudentIds));

    // סנן תלמידים שעדיין לא משויכים לכיתות
    const unassignedStudents = allStudents.filter(student => 
      !assignedStudentIds.has(student.studentId)
    );
    
    console.log('🆓 תלמידים לא משויכים:', unassignedStudents.length);
    console.log('📝 רשימת תלמידים לא משויכים:', unassignedStudents.map(s => s.name));

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
  sendClassHomework,
  addStudentToClass,
  removeStudentFromClass,
  getUnassignedStudents
};
