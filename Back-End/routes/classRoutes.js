const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRole');

const {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getUnassignedStudents
} = require('../controllers/classController');

router.post('/', authMiddleware, authorizeRoles(["admin"]), createClass);
router.get('/', authMiddleware, getAllClasses);
router.get('/:id', authMiddleware, getClassById);
router.put('/:id', authMiddleware, authorizeRoles(["admin"]), updateClass);
router.delete('/:id', authMiddleware, authorizeRoles(["admin"]), deleteClass);

// ✅ נתיבים חדשים לניהול תלמידים בכיתות
router.post('/students/add', authMiddleware, authorizeRoles(["admin"]), addStudentToClass);
router.post('/students/remove', authMiddleware, authorizeRoles(["admin"]), removeStudentFromClass);
router.get('/students/unassigned', authMiddleware, authorizeRoles(["admin"]), getUnassignedStudents);

module.exports = router;
