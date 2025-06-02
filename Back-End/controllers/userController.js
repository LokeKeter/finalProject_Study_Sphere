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
    const { username, password, role } = req.body;

    const user = await User.findOne({ username });

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

//איפוס סיסמא
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const resetPassword = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'משתמש לא נמצא' });

    // יצירת סיסמה חדשה באורך 6 תווים
    const newPassword = crypto.randomBytes(3).toString('hex');
    console.log("📩 סיסמה חדשה נשלחה למייל:");

    // הצפנת הסיסמה החדשה
    user.password = newPassword;

    // שמירה במסד הנתונים
    await user.save();

    // שליחת מייל
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'איפוס סיסמה - StudySphere',
      text: `הסיסמה החדשה שלך היא: >>${newPassword}<<`

      //text: `הסיסמה החדשה שלך היא: ${newPassword}`
    });

    res.json({ message: 'סיסמה נשלחה למייל בהצלחה' });
  } catch (err) {
    console.error("שגיאה באיפוס סיסמה:", err);
    res.status(500).json({ message: 'שגיאה באיפוס הסיסמה' });
  }
};


module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  resetPassword 
};
