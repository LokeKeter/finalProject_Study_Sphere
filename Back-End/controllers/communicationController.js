const communicationService = require("../service/communicationService");
const User = require("../models/User");

exports.sendLetter = async (req, res) => {
  const { senderId, receiverId, subject, content } = req.body;
  const result = await communicationService.createLetter(senderId, receiverId, subject, content);
  res.status(201).json(result);
};

exports.sendSignature = async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  const fileUrl = req.file?.path || "";
  const result = await communicationService.createSignature(senderId, receiverId, content, fileUrl);
  res.status(201).json(result);
};

exports.scheduleMeeting = async (req, res) => {
  const { senderId, receiverId, subject, meetingDate, meetingType } = req.body;
  try {
    const result = await communicationService.createMeeting(senderId, receiverId, subject, meetingDate, meetingType);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.cancelMeeting = async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const result = await communicationService.cancelMeeting(senderId, receiverId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.sendFile = async (req, res) => {
  try {
    console.log(req.body);
    const { senderId, receiverId, content } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "קובץ לא נשלח" });
    }
    const fileUrl = req.file.path;
    const result = await communicationService.createFileUpload(senderId, receiverId, content , fileUrl);

    res.status(201).json({ message: "הקובץ נשלח ונשמר", data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
};

exports.getUserArchive = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await communicationService.getUserArchive(userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
};

exports.getUserArchive = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await communicationService.getUserArchive(userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
};

exports.sendClassMessage = async (req, res) => {
  try {
    const { classId, senderId, content } = req.body;
    await communicationService.sendClassMessage({ classId, senderId, content });
    res.status(201).json({ message: "הודעה נשלחה לכל ההורים" });
  } catch (error) {
    res.status(500).json({ message: "שליחת הודעה נכשלה", error: error.message });
  }
};

exports.getRecentDiscipline = async (req, res) => {
  try {
    const days = Number(req.query.days || 2);
    const teacherId = req.user.id;

    const items = await communicationService.listRecentDiscipline({ teacherId, days });
    res.json(items);
  } catch (err) {
    console.error("❌ getRecentDiscipline error:", err);
    res.status(500).json({ error: "שגיאה בשליפת אירועי משמעת" });
  }
};

exports.getRecentMeetings = async (req, res) => {
  try {
    const days = Math.max(0, parseInt(req.query.days, 10) || 30);
    const senderId = req.query.senderId || req.user?.userId || req.user?.id;
    const limit = Math.min(200, parseInt(req.query.limit, 10) || 100);

    const items = await communicationService.getRecentMeetings({ days, senderId, limit });
    res.json(items);
  } catch (err) {
    console.error('❌ getRecentMeetings:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

exports.getTeachersForParent = async (req, res) => {
  try {
    const parentId = req.params.parentId || req.query.parentId || req.user?.id;
    const items = await communicationService.getTeachersForParent({ parentId });
    return res.json(items);
  } catch (err) {
    console.error('❌ getTeachersForParent:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.listParentMeetings = async (req, res) => {
  try {
    const days = Number(req.query.days) || 60;
    const token = req.headers.authorization || req.headers.Authorization;

    const items = await communicationService.getParentMeetingsByToken(token, days);
    return res.json(items);
  } catch (err) {
    console.error('❌ listParentMeetings:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};