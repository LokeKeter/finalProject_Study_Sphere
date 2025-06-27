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
  enum: ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "יא", "יב"]
},
  students: [studentSchema],
});

module.exports = mongoose.model("Class", classSchema);
