const userService = require("../service/UserService");

const register = async (req, res) => {
  try {
    const result = await userService.createUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  console.log("🟢 UserController.login - data:", req.body);
  try {

    console.log("📥 Login request body:", req.body);

    const result = await userService.login(req.body);
    
    console.log("✅ Login success:", result);

    res.status(200).json(result);
  } catch (err) {

    console.error("❌ Login error:", err.message);

    res.status(401).json({ error: err.message });
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
    const updated = await userService.updateUser(req.params.id, req.body);
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

module.exports = { register, login, getAllUsers, update, deleteUser };