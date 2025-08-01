const { body } = require("express-validator");
const User = require("../models/User");

const allowedGrades = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב'];

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
      console.log("🧪 Validated", value);
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

  // 💡 ולידציה ל־grade רק אם role הוא הורה
  body("grade")
    .if(body("role").equals("parent"))
    .optional()
    .isIn(allowedGrades).withMessage("כיתה לא חוקית – מותר רק מ-א' עד יב'"),

  // 💡 ולידציה לשם התלמיד רק אם role הוא הורה
  body("studentName")
    .if(body("role").equals("parent"))
    .optional()
    .isLength({ min: 2 }).withMessage("שם התלמיד חייב להכיל לפחות 2 תווים"),

  // 💡 ולידציה לתעודת זהות התלמיד רק אם role הוא הורה  
  body("studentId")
    .if(body("role").equals("parent"))
    .optional()
    .isLength({ min: 9, max: 9 }).withMessage("תעודת זהות חייבת להיות בת 9 ספרות")
    .isNumeric().withMessage("תעודת זהות חייבת להכיל רק ספרות")

];

module.exports = {
  registerValidation,
};