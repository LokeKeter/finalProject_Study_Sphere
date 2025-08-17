const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  date:     { type: Date, required: true },
  dateStr:  { type: String },
  className:{ type: String, required: true },
  teacherId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:  { type: String, required: true },
  students: [{
    studentId: String,
    parentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attendance:Boolean,
    homework:  Boolean
  }]
}, { timestamps: true });

AttendanceSchema.index({ teacherId: 1, date: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
