const Archive = require('../models/Archive');

const createArchive = async (req, res) => {
  try {
    const archive = new Archive(req.body);
    await archive.save();
    res.status(201).json(archive);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllArchives = async (req, res) => {
  try {
    const archives = await Archive.find();
    res.json(archives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getArchiveById = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    if (!archive) return res.status(404).json({ error: 'Archive not found' });
    res.json(archive);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateArchive = async (req, res) => {
  try {
    const updated = await Archive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Archive not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteArchive = async (req, res) => {
  try {
    const deleted = await Archive.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Archive not found' });
    res.json({ message: 'Archive deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createArchive,
  getAllArchives,
  getArchiveById,
  updateArchive,
  deleteArchive,
};
