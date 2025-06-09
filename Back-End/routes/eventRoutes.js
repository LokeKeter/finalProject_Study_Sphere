const express = require('express');
const router = express.Router();
const YearlyEvent = require('../models/YearlyEvent');


// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await YearlyEvent.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new event
router.post('/', async (req, res) => {
  const event = new YearlyEvent({
    title: req.body.title,
    date: req.body.date,
    details: req.body.details
  });
  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    await YearlyEvent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted Event' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
