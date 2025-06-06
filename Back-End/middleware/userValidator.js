const { body } = require("express-validator");
const User = require("../models/User");

const registerValidation = [
  // ולידציה לשם משתמש
  body("username")
    .notEmpty().withMessage("יש להזין שם משתמש")
    .custom(async (value) => {
      console.log("🧪 Validating username:", value);
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error("שם המשתמש כבר קיים במערכת");
      }
      return true;
    }),

  // ולידציה לסיסמה
  body("password")
    .isLength({ min: 6 }).withMessage("הסיסמה חייבת להכיל לפחות 6 תווים")
    .matches(/[a-zA-Z]/).withMessage("הסיסמה חייבת להכיל לפחות אות אחת")
    .matches(/[0-9]/).withMessage("הסיסמה חייבת להכיל לפחות מספר אחד"),

  // ולידציה לאימייל
  body("email")
    .notEmpty().withMessage("יש להזין כתובת מייל")
    .isEmail().withMessage("כתובת המייל אינה תקינה"),
];

module.exports = {
  registerValidation,
};