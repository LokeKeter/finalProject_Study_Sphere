const Assignment = require('../models/Assignment');

const createAssignment = async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Assignment not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};
