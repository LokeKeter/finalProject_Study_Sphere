const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} = require('../controllers/AssignmentController');

router.post('/', createAssignment);
router.get('/', getAllAssignments);
router.get('/:id', getAssignmentById);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

module.exports = router;
