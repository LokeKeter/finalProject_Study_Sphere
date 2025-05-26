const express = require('express');
const router = express.Router();
const {
  createArchive,
  getAllArchives,
  getArchiveById,
  updateArchive,
  deleteArchive
} = require('../controllers/ArchiveController');

router.post('/', createArchive);
router.get('/', getAllArchives);
router.get('/:id', getArchiveById);
router.put('/:id', updateArchive);
router.delete('/:id', deleteArchive);

module.exports = router;
