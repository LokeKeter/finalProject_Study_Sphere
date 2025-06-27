const mongoose = require("mongoose");

const studentStatusSchema = new mongoose.Schema({
  studentId: String,
  attendance: Boolean,
  homework: Boolean
});

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  students: [studentStatusSchema]
});

module.exports = mongoose.model("Attendance", attendanceSchema);
