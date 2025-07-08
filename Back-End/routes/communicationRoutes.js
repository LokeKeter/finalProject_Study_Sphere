const express = require("express");
const router = express.Router();
const communicationController = require("../controllers/communicationController");
const upload = require('../middleware/fileUpload');

router.post("/send-letter", communicationController.sendLetter);
router.post("/signature", upload.single("file"), communicationController.sendSignature);
router.post("/send-meeting", communicationController.scheduleMeeting);
router.post("/cancel-meeting", communicationController.cancelMeeting);
router.post('/send-file', upload.single('file'), communicationController.sendFile);
router.get('/archive/:userId', communicationController.getUserArchive);
router.post("/send-class-message", communicationController.sendClassMessage);

module.exports = router;
