const { generateTemplate } = require("../service/aiService");
const { sendAIEmail } = require("../service/emailService");
const sanitize = require("../utils/sanitizeInput");
const userService = require("../service/userService");

//יצירת מבנה AI למורה/הורה
exports.generate = async (req, res) => {
  try {
    const sanitized = sanitize(req.body);
    const { id, role } = req.user;
    const user = await userService.getUserById(id);
    const templates = generateTemplate(sanitized, role);
    
    //שליחה למייל
    if (user.email) {
        await sendAIEmail(user.email, "תבניות AI", templates.join("\n\n"));
    }
    console.log("1");
    res.status(200).json({ templates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
