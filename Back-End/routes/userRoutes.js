const express = require("express");
const router = express.Router();
const { registerValidation } = require("../middleware/userValidator");
const { validationResult } = require("express-validator");
const authorizeRoles = require("../middleware/authorizeRole");
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

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

router.post("/login", (req, res, next) => {next();}, userController.login);

router.get("/users", authMiddleware, authorizeRoles(["admin"]), userController.getAllUsers);
router.delete("/users/:id",authMiddleware,authorizeRoles(["admin"]), userController.deleteUser);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
