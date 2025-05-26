const express = require('express');
const router = express.Router();
const {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance
} = require('../controllers/AttendanceController');

router.post('/', createAttendance);
router.get('/', getAllAttendance);
router.get('/:id', getAttendanceById);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

module.exports = router;
