const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: false  // רלוונטי רק להורה
  },
  studentId: {
    type: String,
    required: false  // רלוונטי רק להורה
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'parent'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  subject: {
  type: String,
  enum: ["מתמטיקה", "אנגלית", "לשון", "היסטוריה", "תנ\"ך", "ספרות", "ביולוגיה", "פיזיקה", "כימיה", "מחשבים", "ספורט", "של\"ח"],
  default: undefined 
}
});

module.exports = mongoose.model('User', userSchema);
