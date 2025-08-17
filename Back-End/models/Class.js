const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  // Add fields for names to improve display and debugging
  studentName: {
    type: String,
    default: 'לא ידוע'
  },
  parentName: {
    type: String,
    default: 'לא ידוע'
  }
});

const classSchema = new mongoose.Schema({
  grade: {
  type: String,
  required: true,
},
  students: [studentSchema],
});

classSchema.index({ grade: 1 }, { unique: true });


module.exports = mongoose.model("Class", classSchema);
