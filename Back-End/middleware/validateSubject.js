const allowedSubjects = require("../utils/allowedSubjects");

const validateSubject = (req, res, next) => {
  const { subject } = req.body;

  // אם אין subject – דלג
  if (!subject) return next();

  // אם המקצוע אינו ברשימה – שלח שגיאה
  if (!allowedSubjects.includes(subject)) {
    return res.status(400).json({ error: "המקצוע שנבחר אינו חוקי" });
  }

  next();
};

module.exports = validateSubject;
