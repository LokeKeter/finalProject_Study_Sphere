// service/homeworkService.js
const mongoose = require('mongoose');
const HomeworkClass = require('../models/HomeworkClass');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');

exports.listCurrent = async ({ classId, teacherId } = {}) => {
  const query = { isCurrent: true };

  if (classId) query.classId = classId;

  if (teacherId) {
    query.teacherId = mongoose.Types.ObjectId.isValid(teacherId)
      ? new mongoose.Types.ObjectId(teacherId)
      : teacherId;
  }

  return HomeworkClass.find(query).sort({ createdAt: -1 });
};

exports.getById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid homework id');
    err.status = 400;
    throw err;
  }
  const doc = await HomeworkClass.findById(id);
  if (!doc) {
    const err = new Error('Homework not found');
    err.status = 404;
    throw err;
  }
  return doc;
};

/**
 * עדכון
 */
exports.update = async (id, { classId, subject, content, isCurrent } = {}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid homework id');
    err.status = 400;
    throw err;
  }

  const updates = {};
  if (typeof classId === 'string') updates.classId = classId;
  if (typeof subject === 'string') updates.subject = subject;
  if (typeof content === 'string') updates.content = content;
  if (typeof isCurrent === 'boolean') updates.isCurrent = isCurrent;

  const doc = await HomeworkClass.findByIdAndUpdate(id, updates, { new: true });
  if (!doc) {
    const err = new Error('Homework not found');
    err.status = 404;
    throw err;
  }
  return doc;
};

/**
 * ארכוב (ביטול נוכחי)
 */
exports.archive = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid homework id');
    err.status = 400;
    throw err;
  }
  const doc = await HomeworkClass.findByIdAndUpdate(id, { isCurrent: false }, { new: true });
  if (!doc) {
    const err = new Error('Homework not found');
    err.status = 404;
    throw err;
  }
  return doc;
};

/**
 * מחיקה
 */
exports.remove = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Invalid homework id');
    err.status = 400;
    throw err;
  }
  const doc = await HomeworkClass.findByIdAndDelete(id);
  if (!doc) {
    const err = new Error('Homework not found');
    err.status = 404;
    throw err;
  }
  return { ok: true };
};

exports.sendHomeworkToClass = async ({ classId, teacherId, content, closePrevious = true }) => {
  if (!classId || !teacherId || !content) {
    const err = new Error('classId, teacherId, content נדרשים');
    err.status = 400;
    throw err;
  }

  const teacher = await User.findById(teacherId);
  if (!teacher) {
    const err = new Error('מורה לא נמצא');
    err.status = 404;
    throw err;
  }
  if (!teacher.subject) {
    const err = new Error('למורה אין מקצוע מוגדר');
    err.status = 400;
    throw err;
  }

  const subject = teacher.subject;

  if (closePrevious) {
    await HomeworkClass.updateMany(
      { classId, subject, isCurrent: true },
      { $set: { isCurrent: false } }
    );
  }

  const homework = new HomeworkClass({
    classId,
    teacherId,
    subject,
    content,
    isCurrent: true,
  });

  return homework.save();
};

exports.getCurrentForParent = async (parentId) => {
  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    const err = new Error('Invalid parentId');
    err.status = 400;
    throw err;
  }
  const pid = new mongoose.Types.ObjectId(parentId);
  const student = await Student.findOne({ parentIds: pid })
    .select('grade classId')
    .lean();

  if (!student) {
    return [];
  }
  const grade = String(student.grade || '').trim();
  if (!grade) {
    return []; 
  }
  let classNameFromClass = null;
  if (student.classId && mongoose.Types.ObjectId.isValid(student.classId)) {
    const classDoc = await Class.findById(student.classId).select('grade').lean();
    if (classDoc && classDoc.grade) {
      classNameFromClass = String(classDoc.grade).trim();
    }
  }
  const classIdCandidates = classNameFromClass
    ? [grade, classNameFromClass]
    : [grade];
  const rows = await HomeworkClass.find({
    classId: { $in: classIdCandidates },
    isCurrent: true
  })
    .sort({ createdAt: -1 })
    .lean();
  if (!rows.length) return [];

  const teacherIds = [...new Set(rows.map(r => String(r.teacherId)).filter(Boolean))];
  const nameByTeacher = {};
  if (teacherIds.length) {
    const teachers = await User.find({ _id: { $in: teacherIds } })
      .select('name fullName')
      .lean();
    teachers.forEach(t => {
      nameByTeacher[String(t._id)] = t.fullName || t.name || '';
    });
  }
  return rows.map(r => ({
    ...r,
    id: r._id?.toString(),
    teacherName: nameByTeacher[String(r.teacherId)] || ''
  }));
};
