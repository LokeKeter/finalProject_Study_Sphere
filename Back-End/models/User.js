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
    enum: ['teacher', 'parent', 'admin'],
    required: true
  },
  subject: {
  type: String,
  enum: ["מתמטיקה", "אנגלית", "לשון", "היסטוריה", "תנ\"ך", "ספרות", "ביולוגיה", "פיזיקה", "כימיה", "מחשבים", "ספורט", "של\"ח"],
  default: undefined 
},
  // חדש - לשמירת הכיתות שהמורה מלמד
  assignedClasses: [{
    type: String  // שמות כיתות כמו "ז1", "ח2"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
