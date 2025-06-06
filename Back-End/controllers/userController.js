const userService = require("../service/UserService");
const sanitize = require('../utils/sanitizeInput');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    logger.info(`Register attempt: ${req.body.username}`);
    const sanitizedBody = sanitize(req.body);
    const result = await userService.createUser(sanitizedBody);
    logger.info(`Register success: ${result.username}`);
    res.status(201).json(result);
  } catch (err) {
    logger.error(`Register failed for ${req.body.username}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    logger.info(`Login attempt: ${req.body.username}`);
    const sanitizedBody = sanitize(req.body);
    const result = await userService.login(sanitizedBody);
    logger.info(`Login success: ${result.user.username}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`Login failed for ${req.body.username}: ${err.message}`);
    res.status(401).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    logger.info(`Password reset requested for: ${req.body.username}`);
    const sanitizedBody = sanitize(req.body);
    const result = await userService.resetPassword(sanitizedBody);
    logger.info(`Password reset success for: ${req.body.username}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`Password reset failed for ${req.body.username}: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const sanitizedBody = sanitize(req.body);
    const updated = await userService.updateUser(req.params.id, sanitizedBody);
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { register, login, getAllUsers, update, deleteUser, resetPassword };