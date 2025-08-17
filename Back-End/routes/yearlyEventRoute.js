const express = require('express');
const router = express.Router();

const yearlyEventController = require('../controllers/yearlyEventController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRole');

router.get('/upcoming',  authMiddleware, yearlyEventController.upcoming);
router.get('/',        authMiddleware, authorizeRoles(['admin']), yearlyEventController.list);
router.get('/:id',     authMiddleware, authorizeRoles(['admin']), yearlyEventController.getById);
router.post('/',       authMiddleware, authorizeRoles(['admin']), yearlyEventController.create);
router.put('/:id',     authMiddleware, authorizeRoles(['admin']), yearlyEventController.update);
router.delete('/:id',  authMiddleware, authorizeRoles(['admin']), yearlyEventController.remove);

module.exports = router;
