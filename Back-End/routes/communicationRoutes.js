const express = require("express");
const router = express.Router();
const communicationController = require("../controllers/communicationController");
const upload = require('../middleware/fileUpload');
const auth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");

router.post("/send-letter", communicationController.sendLetter);
router.post("/send-letter-auto", communicationController.sendLetterAuto);
router.post("/signature", upload.single("file"), communicationController.sendSignature);
router.post("/send-meeting", communicationController.scheduleMeeting);
router.post("/cancel-meeting", communicationController.cancelMeeting);
router.post('/send-file', upload.single('file'), communicationController.sendFile);
router.get('/archive/:userId', communicationController.getUserArchive);
router.post("/send-class-message", communicationController.sendClassMessage);
router.get("/discipline/recent", auth, authorizeRoles(["teacher"]),  communicationController.getRecentDiscipline);
router.get('/meetings/recent', auth, authorizeRoles(['teacher', 'parent']), communicationController.getRecentMeetings);
router.get('/contacts/teachers/:parentId',  auth,  authorizeRoles(['parent']),  communicationController.getTeachersForParent);
router.get('/meetings/parent',  auth, authorizeRoles(['parent']), communicationController.listParentMeetings);


module.exports = router;
