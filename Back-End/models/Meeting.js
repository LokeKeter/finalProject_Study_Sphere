const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  location: {
    type: String,
    enum: ['Zoom', 'פרונטלי'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);
