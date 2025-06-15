const { generateTemplate } = require("../service/aiService");
const { sendAIEmail } = require("../service/emailService");
const sanitize = require("../utils/sanitizeInput");
const userService = require("../service/userService");
const logger = require('../utils/logger');

//יצירת מבנה AI למורה/הורה
exports.generate = async (req, res) => {
  try {
    const sanitized = sanitize(req.body);
    const { id, role } = req.user;
    const user = await userService.getUserById(id);
    const templates = generateTemplate(sanitized, role);
    
    //שליחה למייל
    if (user.email) {
        await sendAIEmail(user.email, "תבנית AI", templates.join("\n\n"));
    logger.info(`✔️ AI template sent to ${user.email} (userId: ${id})`);
    } else {
      logger.warn(`⚠️ User ${id} has no email – skipping email sending`);
    }
    res.status(200).json({ templates });
  } catch (err) {
    logger.error(`❌ Error generating AI template: ${err.message}`, {
      userId: req.user?.id || 'unknown',
      stack: err.stack,
    });
    res.status(500).json({ error: err.message });
  }
};
