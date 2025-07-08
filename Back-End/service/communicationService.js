const Communication = require("../models/Communication");
const User = require("../models/User");
const Class = require("../models/Class");

exports.createLetter = (senderId, receiverId, subject, content) => {
  return Communication.create({ type: "letter", senderId, receiverId, subject, content });
};

exports.createSignature = (senderId, receiverId, content, fileUrl) => {
  return Communication.create({ type: "signature", senderId, receiverId, content, fileUrl });
};

exports.createMeeting = async (senderId, receiverId, subject, meetingDate, meetingType) => {
  // בדיקה אם קיימת כבר פגישה פעילה (type: meeting)
  const existing = await Communication.findOne({
    senderId,
    receiverId,
    type: "meeting"
  });

  if (existing) {
    throw new Error("כבר קיימת פגישה פעילה עם ההורה הזה");
  }

  // יצירת פגישה חדשה
  return Communication.create({ 
    type: "meeting", 
    senderId, 
    receiverId, 
    subject, 
    meetingDate, 
    meetingType 
  });
};

//ביטול פגישה
exports.cancelMeeting = async (senderId, receiverId) => {
  // 1. מחיקת הפגישה המקורית (האחרונה)
  const lastMeeting = await Communication.findOneAndDelete({
    type: "meeting",
    senderId,
    receiverId
  }, { sort: { createdAt: -1 } });
  // 2. אם לא נמצאה פגישה, החזר הודעת שגיאה
  if (!lastMeeting) {
    throw new Error("לא נמצאה פגישה לביטול");
  }

  // 3. שליפת שם מורה
  const teacher = await User.findById(senderId);
  const teacherName = teacher ? teacher.fullName || teacher.name || "המורה" : "המורה";

  // 4. יצירת מכתב חדש
  const cancelMessage = `הפגישה בתאריך ${lastMeeting.meetingDate} עם ${teacherName} בוטלה`;
  const newLetter = await Communication.create({
    type: "letter",
    senderId,
    receiverId,
    subject: "ביטול פגישה",
    content: cancelMessage
  });

  return newLetter;
};

exports.createFileUpload = async (senderId, receiverId, description, fileUrl) => {
  console.log("2.0");
  const newCommunication = new Communication({
    type: 'signature',
    senderId,
    receiverId,
    content: description, // נשמר בשדה content כי זה תיאור
    fileUrl,
    createdAt: new Date()
  });
  console.log("3.0");
  return await newCommunication.save();
};

exports.getUserArchive = async (userId) => {
  const messages = await Communication.find({
    $or: [
      { senderId: userId },
      { receiverId: userId }
    ]
  })
    .sort({ createdAt: -1 })
    .populate("senderId", "fullName name")
    .lean();

  return messages.map(msg => ({
    id: msg._id,
    title: msg.subject || "ללא נושא",
    sender: msg.senderId?.fullName || msg.senderId?.name || "שולח לא ידוע",
    date: new Date(msg.createdAt).toLocaleDateString("he-IL"),
    classId: msg.classId || "כיתה כללית"
  }));
};

exports.getUserArchive = async (userId) => {
  const messages = await Communication.find({
    $or: [{ senderId: userId }, { receiverId: userId }]
  })
    .sort({ createdAt: -1 })
    .populate("senderId", "fullName name")
    .populate("classId", "name") // ✅ מוסיף את שם הכיתה
    .lean();

  return messages.map(msg => ({
    id: msg._id,
    title: msg.subject || "ללא נושא",
    sender: msg.senderId?.fullName || msg.senderId?.name || "שולח לא ידוע",
    date: new Date(msg.createdAt).toLocaleDateString("he-IL"),
    className: msg.classId?.name || "כיתה כללית"
  }));
};

exports.sendClassMessage = async ({ classId, senderId, content }) => {
  const classDoc = await Class.findOne({ grade: classId });
  if (!classDoc) throw new Error("כיתה לא נמצאה");

  const parentIds = classDoc.students.map(s => s.parentId);

  const messages = parentIds.map(parentId => ({
    type: "letter",
    senderId,
    receiverId: parentId,
    subject: "הודעה כיתתית",
    content
  }));

  await Communication.insertMany(messages);
};
