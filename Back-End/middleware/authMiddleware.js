const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "⛔ טוקן לא קיים או לא תקין" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // שומר את id וה־role בבקשה
    next(); // ממשיכים הלאה ל־controller
  } catch (err) {
    return res.status(401).json({ message: "⛔ טוקן שגוי או פג תוקף" });
  }
}

module.exports = authMiddleware;