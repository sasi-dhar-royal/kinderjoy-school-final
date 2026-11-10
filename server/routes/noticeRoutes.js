const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');
const Notice = require('../models/Notice');
const { protect } = require('../middleware/auth');

// GET /api/notices
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const { type, category, targetClass } = req.query;
    let query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (targetClass && targetClass !== 'All') {
      query.targetClasses = { $in: ['All', targetClass] };
    }

    const notices = await Notice.find(query).sort({ isUrgent: -1, publishDate: -1 });
    res.json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notices (Protected)
router.post('/', protect, async (req, res) => {
  try {
    await connectDB();
    const { title, content, type, category, targetClasses, isUrgent, eventDate, attachmentUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide title and content' });
    }

    let validCategory = category || 'General';
    let validType = type || 'event';

    const notice = await Notice.create({
      title,
      content,
      type: validType,
      category: validCategory,
      targetClasses: targetClasses || ['All'],
      isUrgent: isUrgent || false,
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      attachmentUrl: attachmentUrl || ''
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notices/:id (Protected)
router.put('/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const { title, content, type, category, targetClasses, isUrgent, eventDate } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (targetClasses) updateData.targetClasses = targetClasses;
    if (typeof isUrgent === 'boolean') updateData.isUrgent = isUrgent;
    if (eventDate) updateData.eventDate = new Date(eventDate);

    const updated = await Notice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/notices/:id (Protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
