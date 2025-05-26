const classSchema = new mongoose.Schema({
  className: String,
  gradeLevel: String,
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subject: String,
  schedule: String // או מבנה מפורט אם רוצים שעות לימוד
});
