const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');
const GalleryItem = require('../models/GalleryItem');
const { protect } = require('../middleware/auth');

// GET /api/gallery (Public - NEVER throws 500)
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const { category } = req.query;
    const filter = category && category !== 'all' ? { category } : {};

    let items = [];
    try {
      items = await GalleryItem.find(filter).sort({ uploadDate: -1 });
    } catch (dbErr) {
      console.warn('Gallery query failed, returning empty:', dbErr.message);
      items = [];
    }

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    res.json({ success: true, count: 0, data: [] });
  }
});

// DELETE /api/gallery/:id (Protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }
    res.json({ success: true, message: 'Photo removed from gallery' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
