function authorizeRoles(allowedRoles = []) {
  return (req, res, next) => {

    console.log("🔴 Role Check:", req.user?.role, "allowed:", allowedRoles);

    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "⛔ אין לך הרשאה לביצוע פעולה זו" });
    }

    next(); // המשתמש מאושר – המשך ל־controller
  };
}

module.exports = authorizeRoles;