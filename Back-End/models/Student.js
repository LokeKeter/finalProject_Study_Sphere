const studentSchema = new mongoose.Schema({
  name: String,
  idNumber: String,
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  parentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});
