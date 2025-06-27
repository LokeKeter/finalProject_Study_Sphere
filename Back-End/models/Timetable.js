// models/Timetable.js
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["ראשון", "שני", "שלישי", "רביעי", "חמישי"],
    required: true
  },
  startTime: {
    type: String, // דוגמה: "08:00"
    required: true
  },
  endTime: {
    type: String, // דוגמה: "09:00"
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  className: {
    type: String,
    required: true // כמו "ז1", "ח2"
  }
});

const timetableSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true
  },
  lessons: {
    type: [lessonSchema],
    default: []
  },
});

module.exports = mongoose.model('Timetable', timetableSchema);
