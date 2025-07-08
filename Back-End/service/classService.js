const HomeworkClass = require("../models/HomeworkClass");

exports.sendHomeworkToClass = async ({ classId, teacherId, subject, content }) => {
  const homework = new HomeworkClass({
    classId,
    teacherId,
    subject,
    content
  });

  return await homework.save();
};
