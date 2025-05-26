const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage
} = require('../controllers/messageController');

router.post('/', sendMessage);
router.get('/', getAllMessages);
router.get('/:id', getMessageById);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
