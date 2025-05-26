const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId, // מקשר למורה
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId, // מקשר לכיתה
    ref: 'Class',
    required: true
  },
  students: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
      },
      score: {
        type: Number,
        required: true
      }
    }
  ],
  dateSent: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Grade', gradeSchema);
