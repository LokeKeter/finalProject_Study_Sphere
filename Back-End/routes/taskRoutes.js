// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/authorizeRole");

// רק למורה
router.get("/", authMiddleware, authorizeRole(["teacher"]), taskController.getAll);
router.post("/", authMiddleware, authorizeRole(["teacher"]), taskController.create);
router.patch("/:id/toggle", authMiddleware, authorizeRole(["teacher"]), taskController.toggle);
router.delete("/:id", authMiddleware, authorizeRole(["teacher"]), taskController.remove);

module.exports = router;
