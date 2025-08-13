const YearlyEvent = require('../models/YearlyEvent');
const mongoose = require('mongoose');

// עוזר: המרה בטוחה לתאריך (מחרוזת "YYYY-MM-DD" → Date בתחילת היום ב-UTC)
function parseIsoDateOrThrow(dateStr) {
  if (!dateStr) throw new Error('date is required');
  // אם קיבלנו כבר Date – נחזיר כמו שהוא
  if (dateStr instanceof Date) return dateStr;
  // כדי להימנע מהיסט timezone בשמירה – נוסיף T00:00Z
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date format');
  return d;
}

exports.list = async ({ from, to, q }) => {
  const query = {};
  // טווח תאריכים אופציונלי
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = parseIsoDateOrThrow(from);
    if (to)   query.date.$lte = parseIsoDateOrThrow(to);
  }
  // חיפוש חופשי בכותרת/פירוט (לא חובה)
  if (q) {
    const rx = new RegExp(q, 'i');
    query.$or = [{ title: rx }, { details: rx }];
  }

  const events = await YearlyEvent.find(query).sort({ date: 1, title: 1 }).lean();
  // נוודא שיש id ידידותי לפרונט
  return events.map(e => ({ ...e, id: e._id?.toString() }));
};

exports.getById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return YearlyEvent.findById(id).lean();
};

exports.create = async ({ title, date, details }) => {
  if (!title?.trim()) throw new Error('title is required');
  const dateObj = parseIsoDateOrThrow(date);

  const doc = new YearlyEvent({
    title: title.trim(),
    date : dateObj,
    details: details || ''
  });

  const saved = await doc.save();
  return saved.toObject();
};

exports.update = async (id, { title, date, details }) => {
  if (!mongoose.isValidObjectId(id)) return null;

  const update = {};
  if (typeof title === 'string')  update.title = title.trim();
  if (typeof details === 'string') update.details = details;
  if (typeof date !== 'undefined') update.date = parseIsoDateOrThrow(date);

  const updated = await YearlyEvent.findByIdAndUpdate(
    id,
    update,
    { new: true, runValidators: true }
  ).lean();

  return updated;
};

exports.remove = async (id) => {
  if (!mongoose.isValidObjectId(id)) return false;
  const res = await YearlyEvent.findByIdAndDelete(id);
  return !!res;
};
