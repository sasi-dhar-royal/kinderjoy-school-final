const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');
const VisitorCount = require('../models/VisitorCount');

// Fallback in-memory count
let fallbackCount = 478;

// GET /api/visitors - Fetch and increment visitor count
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const doc = await VisitorCount.findOneAndUpdate(
      { key: 'school_total' },
      { $inc: { count: 1 }, $set: { lastUpdated: new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, count: doc.count });
  } catch (err) {
    fallbackCount += 1;
    res.json({ success: true, count: fallbackCount });
  }
});

module.exports = router;

