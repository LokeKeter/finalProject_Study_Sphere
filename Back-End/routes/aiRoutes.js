// routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");

// תבניות AI קיימות
router.post(
  "/template",
  authMiddleware,
  authorizeRoles(["teacher", "parent"]),
  aiController.generate
);

// צ'אט AI חדש
router.post(
  "/chat",
  authMiddleware,
  authorizeRoles(["teacher", "parent"]), // רק למורה
  aiController.chat // פונקציה חדשה ב־controllers/aiController.js
);

module.exports = router;
