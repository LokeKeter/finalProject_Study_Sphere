const yearlyEventService = require('../service/yearlyEventService');

// 5 הקרובים מהיום והלאה
exports.upcoming = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 5), 50);

    // היום בחצות UTC → "YYYY-MM-DD"
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    const from = todayUtc.toISOString().slice(0, 10);
    const events = await yearlyEventService.upcoming({ limit });
    return res.json(events);
  } catch (e) {
    console.error('❌ yearlyEvents.upcoming:', e.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/yearlyevents?from=YYYY-MM-DD&to=YYYY-MM-DD&q=...
exports.list = async (req, res) => {
  try {
    const { from, to, q } = req.query;
    const events = await yearlyEventService.list({ from, to, q });
    return res.json(events);
  } catch (err) {
    console.error('❌ list yearly events:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/yearlyevents/:id
exports.getById = async (req, res) => {
  try {
    const event = await yearlyEventService.getById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    return res.json(event);
  } catch (err) {
    console.error('❌ get yearly event:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/yearlyevents
exports.create = async (req, res) => {
  try {
    const { title, date, details } = req.body;
    const created = await yearlyEventService.create({ title, date, details });
    return res.status(201).json(created);
  } catch (err) {
    console.error('❌ create yearly event:', err);
    const code = err.name === 'ValidationError' ? 400 : 500;
    return res.status(code).json({ message: err.message || 'Server error' });
  }
};

// PUT /api/yearlyevents/:id
exports.update = async (req, res) => {
  try {
    const { title, date, details } = req.body;
    const updated = await yearlyEventService.update(req.params.id, { title, date, details });
    if (!updated) return res.status(404).json({ message: 'Event not found' });
    return res.json(updated);
  } catch (err) {
    console.error('❌ update yearly event:', err);
    const code = err.name === 'ValidationError' ? 400 : 500;
    return res.status(code).json({ message: err.message || 'Server error' });
  }
};

// DELETE /api/yearlyevents/:id
exports.remove = async (req, res) => {
  try {
    const ok = await yearlyEventService.remove(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Event not found' });
    return res.status(204).send(); // פרונט לא מצפה לגוף תשובה במחיקה
  } catch (err) {
    console.error('❌ delete yearly event:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
