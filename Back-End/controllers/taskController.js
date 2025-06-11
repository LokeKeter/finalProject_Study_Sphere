const taskService = require("../service/taskService");
const logger = require('../utils/logger');
const sanitize = require('../utils/sanitizeInput');
//יצירת משימה חדשה
const create = async (req, res) => {
  try {
    logger.info(` יצירת משימה חדשה עבור משתמש: ${req.user.id}`);
    const sanitizedBody = sanitize(req.body);
    const task = await taskService.createTask({
      ...sanitizedBody,
      teacherId: req.user.id,
    });
    logger.info(` משימה נוצרה בהצלחה: ${task.title}`);
    res.status(201).json(task);
  } catch (err) {
    logger.error(` שגיאה ביצירת משימה עבור ${req.user.id}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};
//כל המשימות של אותו מורה
const getAll = async (req, res) => {
  try {
    logger.info(`📄 שליפת משימות עבור מורה: ${req.user.id}`);
    const tasks = await taskService.getTasksByTeacher(req.user.id);
    res.status(200).json(tasks);
  } catch (err) {
    logger.error(`❌ שגיאה בשליפת משימות: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
//משימה הושלמה/ לא הושלמה
const toggle = async (req, res) => {
  try {
    logger.info(` החלפת סטטוס משימה ${req.params.id}`);
    const updated = await taskService.toggleTask(req.params.id);
    res.json(updated);
  } catch (err) {
    logger.error(` שגיאה בהחלפת סטטוס משימה ${req.params.id}: ${err.message}`);
    res.status(404).json({ error: err.message });
  }
};
//מחיקת משימה
const remove = async (req, res) => {
  try {
    logger.info(` בקשת מחיקת משימה ${req.params.id}`);
    await taskService.deleteTask(req.params.id);
    res.status(204).send();
  } catch (err) {
    logger.error(` שגיאה במחיקת משימה ${req.params.id}: ${err.message}`);
    res.status(404).json({ error: err.message });
  }
};

module.exports = { create, getAll, toggle, remove };
