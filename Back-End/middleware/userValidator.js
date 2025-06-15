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
  .notEmpty().withMessage("יש להזין כיתה עבור הורה")
  .isIn(allowedGrades).withMessage("כיתה לא חוקית – מותר רק מ-א' עד יב'")

];

module.exports = {
  registerValidation,
};