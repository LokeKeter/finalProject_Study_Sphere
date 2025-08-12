// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in environment");
  // טוב ליפול בעלייה מאשר לגלות אחר כך
  throw new Error("JWT_SECRET not set");
}

function authMiddleware(req, res, next) {
  try {
    // 1) משיכת טוקן מהכותרת או מעוגייה (אופציונלי)
    let token = null;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === "string") {
      const [scheme, value] = authHeader.split(" ");
      if (scheme?.toLowerCase() === "bearer" && value) token = value.trim();
    }
    // אם תרצה גם מעוגייה:
    if (!token && req.cookies?.token) token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "⛔ לא סופק טוקן (Authorization: Bearer ...)" });
    }

    // 2) אימות הטוקן
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"], // התאם למה שאתה יוצר בו את הטוקן
      // clockTolerance: 5 // שניות, אם תרצה “סלחנות” לשעון
    });

    // 3) הצמדה נוחה לבקשה
    req.user = decoded; // כולל id ו-role כפי שאתה יוצר בטוקן
    req.userId = decoded.id;
    req.userRole = decoded.role;

    return next();
  } catch (err) {
    // אפשר להבחין בין סוגי שגיאה אם רוצים פירוט:
    // TokenExpiredError / JsonWebTokenError / NotBeforeError
    return res.status(401).json({ message: "⛔ טוקן שגוי או פג תוקף" });
  }
}

module.exports = authMiddleware;
