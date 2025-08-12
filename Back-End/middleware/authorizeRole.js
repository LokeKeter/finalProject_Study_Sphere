// middleware/authorizeRole.js
function authorizeRoles(allowedRoles = []) {
  // נוודא שזו תמיד רשימה
  if (!Array.isArray(allowedRoles)) {
    throw new Error("authorizeRoles expects an array of allowed roles");
  }

  return (req, res, next) => {
    // אם אין מידע על המשתמש — כנראה לא עבר דרך authMiddleware
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "⛔ המשתמש לא מאומת" });
    }

    const userRole = String(req.user.role).toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => String(r).toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "⛔ אין לך הרשאה לביצוע פעולה זו" });
    }

    // המשתמש מאושר — ממשיכים
    next();
  };
}

module.exports = authorizeRoles;
