const mongoose = require("mongoose");

const studentStatusSchema = new mongoose.Schema({
  parentId: String,
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
  subject: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  students: [studentStatusSchema]
});

module.exports = mongoose.model("Attendance", attendanceSchema);
