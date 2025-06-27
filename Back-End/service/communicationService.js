const Communication = require("../models/Communication");

exports.createLetter = (teacherId, parentId, subject, content) => {
  console.log("הגעתי לSERVICE!")
  return Communication.create({ type: "letter", teacherId, parentId, subject, content });
};

exports.createSignature = (teacherId, parentId, content, fileUrl) => {
  return Communication.create({ type: "signature", teacherId, parentId, content, fileUrl });
};

exports.createMeeting = (teacherId, parentId, subject, meetingDate, meetingType) => {
  return Communication.create({ type: "meeting", teacherId, parentId, subject, meetingDate, meetingType });
};

exports.cancelMeeting = async (teacherId, parentId) => {
  // תיעוד פעולה - לא מוחקים אלא מוסיפים פעולה מסוג ביטול
  return Communication.create({ type: "cancel", teacherId, parentId, content: "פגישה בוטלה" });
};

exports.createFileUpload = async (teacherId, parentId, description, fileUrl) => {
  console.log("2.0");
  const newCommunication = new Communication({
    type: 'signature',
    teacherId,
    parentId,
    content: description, // נשמר בשדה content כי זה תיאור
    fileUrl,
    createdAt: new Date()
  });
  console.log("3.0");
  return await newCommunication.save();
};
