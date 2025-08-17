const service = require('../service/homeworkService');

exports.create = async (req, res) => {
  try {
    // ודא שה-authMiddleware מגדיר אחד מאלה:
    const teacherId = req.user?.userId || req.user?.id || req.user?._id;
    const { classId, content, closePrevious = true } = req.body;

    const doc = await service.create({
      classId,
      teacherId,
      content,
      closePrevious
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('❌ create homework:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

exports.listCurrent = async (req, res) => {
  try {
    const classId = req.query.classId || undefined;
    const role = req.user?.role;
    let teacherId;
    if (role === 'teacher') {
      teacherId = req.user?.userId || req.user?.id || req.user?._id;
    } else if (role === 'admin' && req.query.teacherId) {
      teacherId = req.query.teacherId;
    }
    const items = await service.listCurrent({ classId, teacherId });
    res.json(items);
  } catch (err) {
    console.error('❌ list current homework:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await service.getById(req.params.id);
    res.json(item);
  } catch (err) {
    console.error('❌ get homework:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await service.update(req.params.id, {
      classId: req.body.classId,
      subject: req.body.subject,
      content: req.body.content,
      isCurrent: typeof req.body.isCurrent === 'boolean' ? req.body.isCurrent : undefined
    });
    res.json(updated);
  } catch (err) {
    console.error('❌ update homework:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

exports.archive = async (req, res) => {
  try {
    const updated = await service.archive(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('❌ archive homework:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await service.remove(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('❌ delete homework:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

exports.sendClassHomework = async (req, res) => {
  try {
    const teacherId = req.user?.userId || req.user?.id || req.user?._id;
    const { classId, content, closePrevious = true } = req.body;
    const result = await service.sendHomeworkToClass({ classId, teacherId, content, closePrevious });
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ sendClassHomework:', error);
    res.status(500).json({ message: "שליחת שיעורי בית נכשלה", error: error.message });
  }
};

exports.currentForParent = async (req, res) => {
  try {
    const parentId = String(req.user?._id || req.user?.id || req.query.parentId || '');
    if (!parentId) {
      return res.status(400).json({ message: 'parentId is required' });
    }
    const items = await service.getCurrentForParent(parentId);
    return res.json(items);
  } catch (err) {
    console.error('❌ currentForParent:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};
