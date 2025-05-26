const Meeting = require('../models/Meeting');

const createMeeting = async (req, res) => {
  try {
    const newMeeting = new Meeting(req.body);
    await newMeeting.save();
    res.status(201).json(newMeeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find();
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const updated = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Meeting not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const deleted = await Meeting.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ message: 'Meeting deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
};
