const communicationService = require("../service/communicationService");

exports.sendLetter = async (req, res) => {
    console.log("1.1");
  const { teacherId, parentId, subject, content } = req.body;
  const result = await communicationService.createLetter(teacherId, parentId, subject, content);
  res.status(201).json(result);
};

exports.sendSignature = async (req, res) => {
  const { teacherId, parentId, content } = req.body;
  const fileUrl = req.file?.path || "";
  const result = await communicationService.createSignature(teacherId, parentId, content, fileUrl);
  res.status(201).json(result);
};

exports.scheduleMeeting = async (req, res) => {
  const { teacherId, parentId, subject, meetingDate, meetingType } = req.body;
  const result = await communicationService.createMeeting(teacherId, parentId, subject, meetingDate, meetingType);
  res.status(201).json(result);
};

exports.cancelMeeting = async (req, res) => {
  const { teacherId, parentId } = req.body;
  const result = await communicationService.cancelMeeting(teacherId, parentId);
  res.status(200).json(result);
};

exports.sendFile = async (req, res) => {
  try {
    const { teacherId, parentId, description } = req.body;
    console.log("1.0 in sendfile", req.body);
    if (!req.file) {
      console.log("1.01");
      return res.status(400).json({ message: "קובץ לא נשלח" });
    }
    console.log("1.1");
    const fileUrl = req.file.path;
    const result = await communicationService.createFileUpload(teacherId, parentId, description, fileUrl);

    res.status(201).json({ message: "הקובץ נשלח ונשמר", data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "שגיאת שרת", error: err.message });
  }
};

