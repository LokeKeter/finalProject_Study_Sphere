const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/homeworkController');
const auth = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/authorizeRole');

// יכולים לראות שיעורי בית נוכחיים
router.get('/current', auth, authorizeRole(['parent', 'teacher', 'admin']), ctrl.listCurrent);

// קריאה בודדת
router.get('/:id', auth, authorizeRole(['parent', 'teacher', 'admin']), ctrl.getById);

// יצירה – רק מורה/מנהל
router.post('/', auth, authorizeRole(['teacher', 'admin']), ctrl.create);

// עדכון – רק מורה/מנהל
router.put('/:id', auth, authorizeRole(['teacher', 'admin']), ctrl.update);

// ארכוב – רק מורה/מנהל
router.patch('/:id/archive', auth, authorizeRole(['teacher', 'admin']), ctrl.archive);

// מחיקה – עדיף מנהל בלבד 
router.delete('/:id', auth, authorizeRole(['admin']), ctrl.remove);

//שליחת שיעורי בית
router.post('/send', auth, authorizeRole(['teacher']), ctrl.sendClassHomework);

// הורה רואה שיעורי בית נוכחיים לילד/ים שלו
router.get('/parent/current', auth, authorizeRole(['parent']), ctrl.currentForParent);

module.exports = router;
