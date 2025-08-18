const express = require("express");
const router = express.Router();
const { registerValidation } = require("../middleware/userValidator");
const { validationResult } = require("express-validator");
const authorizeRoles = require("../middleware/authorizeRole");
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
const validateSubject = require("../middleware/validateSubject");

//נתיב הרשמה
router.post(
  "/register",
  registerValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.register
);

// ✅ נתיב יצירת משתמשים למנהלים בלבד
router.post(
  "/create-user",
  authMiddleware,
  authorizeRoles(["admin"]),
  registerValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.register
);

router.post("/login", (req, res, next) => {next();}, userController.login);
router.put('/me', authMiddleware, userController.updateMe);
router.put('/:id([0-9a-fA-F]{24})', authMiddleware, validateSubject, userController.updateUser);
router.get("/users", authMiddleware, authorizeRoles(["admin"]), userController.getAllUsers);
router.delete("/users/:id",authMiddleware,authorizeRoles(["admin"]), userController.deleteUser);
router.post("/reset-password", userController.resetPassword);
router.get("/teachers", authMiddleware, authorizeRoles(["admin"]), userController.getAllTeachers);
router.get("/parents", authMiddleware, authorizeRoles(["admin"]), userController.getAllParents);
router.get("/students", authMiddleware, authorizeRoles(["admin"]), userController.getAllStudents);
router.post("/assign-teacher", authMiddleware, authorizeRoles(["admin"]), userController.assignTeacherToClass);
router.post("/remove-teacher", authMiddleware, authorizeRoles(["admin"]), userController.removeTeacherFromClass);
router.get("/my-classes", authMiddleware, authorizeRoles(["teacher"]), userController.getMyClasses);
router.post("/create-parent-for-student", authMiddleware, userController.createParentForStudent);

module.exports = router;
