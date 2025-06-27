const mongoose = require("mongoose");

const communicationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["letter", "signature", "meeting", "cancel"],
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subject: String, // למכתב או פגישה
  content: String, // תוכן מכתב או תיאור קובץ
  meetingType: String, // "זום" או "פרונטלי"
  meetingDate: String,
  fileUrl: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Communication", communicationSchema);
