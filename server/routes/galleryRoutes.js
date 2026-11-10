const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('../config/db');
const GalleryItem = require('../models/GalleryItem');
const { protect } = require('../middleware/auth');

// Storage Configuration (Disk for local, memory fallback for serverless)
const uploadDir = path.join(__dirname, '../../uploads/gallery');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + unique + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
  }
});

// GET /api/gallery (Public - NEVER throws 500)
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const { category } = req.query;
    const filter = category && category !== 'all' ? { category } : {};

    let items = [];
    try {
      items = await GalleryItem.find(filter).sort({ createdAt: -1 });
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

// POST /api/gallery (Protected Admin - Upload Photo)
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    await connectDB();
    const { title, caption, category, imageUrl } = req.body;
    let finalImageUrl = imageUrl || '';

    if (req.file) {
      finalImageUrl = `/uploads/gallery/${req.file.filename}`;
    }

    if (!title || !finalImageUrl) {
      return res.status(400).json({ success: false, message: 'Photo title and image are required' });
    }

    const newObj = {
      title,
      caption: caption || '',
      category: category || 'annual-day',
      imageUrl: finalImageUrl,
      createdAt: new Date()
    };

    const result = await GalleryItem.create(newObj);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving gallery photo:', error);
    res.status(500).json({ success: false, message: error.message });
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

    if (item.imageUrl && item.imageUrl.startsWith('/uploads/gallery/')) {
      const filePath = path.join(__dirname, '../..', item.imageUrl);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}
    }

    res.json({ success: true, message: 'Photo removed from gallery' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
