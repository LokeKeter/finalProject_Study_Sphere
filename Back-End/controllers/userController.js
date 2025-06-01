const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//שליטה על התחברות
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  try {
    console.log("📦 DATABASE בפועל:", require("mongoose").connection.name);
    const { username, password, role } = req.body;

    const user = await User.findOne({ username });
    console.log("🔍 תוצאה מ־MongoDB:", user);

    if (!user) {
      return res.status(401).json({ message: '❌ משתמש לא נמצא' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '❌ סיסמה שגויה' });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: '⚠️ תפקיד לא תואם למשתמש' });
    }

    res.json({
      id: user._id,
      username: user.username,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: '🔥 שגיאת שרת' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login
};
