// routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");

router.post("/template", authMiddleware, authorizeRoles(["teacher", "parent"]), aiController.generate);

module.exports = router;