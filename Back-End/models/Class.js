const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentId: {
    type: String,
    required: true,
  },
});

const classSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,
  },
  classNumber: {
    type: Number,
    required: true,
  },
  students: [studentSchema],
});

module.exports = mongoose.model("Class", classSchema);
