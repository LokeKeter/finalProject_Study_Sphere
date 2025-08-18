const communicationService = require("../service/communicationService");
const User = require("../models/User");

exports.sendLetter = async (req, res) => {
  try {
    const { senderId, receiverId, subject, content } = req.body;
    
    // ✅ Validate required fields
    if (!senderId || !receiverId || !subject || !content) {
      return res.status(400).json({ 
        message: "כל השדות נדרשים: senderId, receiverId, subject, content" 
      });
    }

    console.log('📤 Creating letter:', { senderId, receiverId, subject, content });
    
    const result = await communicationService.createLetter(senderId, receiverId, subject, content);
    
    console.log('✅ Letter created successfully:', result);
    res.status(201).json({ message: "המכתב נשלח בהצלחה", data: result });
    
  } catch (error) {
    console.error('❌ Error in sendLetter controller:', error);
    res.status(500).json({ 
      message: "שגיאה בשליחת המכתב", 
      error: error.message 
    });
  }
};

// New endpoint for sending letters with auto-parent creation
exports.sendLetterAuto = async (req, res) => {
  try {
    const { senderId, receiverId, subject, content, studentName, autoCreateParent } = req.body;
    
    // ✅ Validate required fields
    if (!senderId || !subject || !content || !studentName) {
      return res.status(400).json({ 
        message: "כל השדות נדרשים: senderId, subject, content, studentName" 
      });
    }

    console.log('📤 Creating letter with auto-parent:', { 
      senderId, 
      receiverId, 
      subject, 
      content,
      studentName,
      autoCreateParent 
    });
    
    // Create a parent user if needed
    const result = await communicationService.createLetterWithParent(
      senderId, 
      receiverId, 
      subject, 
      content, 
      studentName
    );
    
    console.log('✅ Letter created successfully with auto-parent:', result);
    res.status(201).json({ 
      message: "המכתב נשלח בהצלחה והורה נוצר במערכת", 
      data: result 
    });
    
  } catch (error) {
    console.error('❌ Error in sendLetterAuto controller:', error);
    res.status(500).json({ 
      message: "שגיאה בשליחת המכתב", 
      error: error.message 
    });
  }
};

exports.sendSignature = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    
    // ✅ Validate required fields
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ 
        message: "כל השדות נדרשים: senderId, receiverId, content" 
      });
    }
    
    const fileUrl = req.file?.path || "";
    console.log('📤 Creating signature:', { 
      senderId, 
      receiverId, 
      content, 
      hasFile: !!fileUrl,
      fileName: req.file?.originalname
    });
    
    const result = await communicationService.createSignature(senderId, receiverId, content, fileUrl);
    
    console.log('✅ Signature created successfully:', result._id);
    res.status(201).json({ 
      message: "האישור נשלח בהצלחה", 
      data: result 
    });
    
  } catch (error) {
    console.error('❌ Error in sendSignature controller:', error);
    res.status(500).json({ 
      message: "שגיאה בשליחת האישור", 
      error: error.message 
    });
  }
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
    console.log('📥 getTeachersForParent controller called');
    const parentId = req.params.parentId || req.query.parentId || req.user?.id;
    
    console.log('👤 Parent ID from request:', parentId);
    console.log('🔑 Token user:', req.user);
    
    if (!parentId) {
      console.error('❌ No parentId provided in request');
      return res.status(400).json({ 
        message: 'חסר מזהה הורה בבקשה',
        error: 'Missing parentId'
      });
    }
    
    const items = await communicationService.getTeachersForParent({ parentId });
    console.log(`✅ Found ${items.length} teachers for parent ${parentId}`);
    
    return res.json(items);
  } catch (err) {
    console.error('❌ getTeachersForParent:', err);
    return res.status(500).json({ 
      message: 'שגיאה בשרת בעת איתור מורים',
      error: err.message 
    });
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