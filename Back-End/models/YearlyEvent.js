const mongoose = require('mongoose');

const YearlyEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  details: { type: String },
});

module.exports = mongoose.model('YearlyEvent', YearlyEventSchema);
