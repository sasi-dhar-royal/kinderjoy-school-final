const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');
const ExamSchedule = require('../models/ExamSchedule');
const { protect } = require('../middleware/auth');

// GET /api/schedules (Public - NEVER throws 500)
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const { academicYear, examType, className } = req.query;
    let query = {};
    if (academicYear) query.academicYear = academicYear;
    if (examType) query.examType = examType;
    if (className && className !== 'All') query.className = className;

    let schedules = [];
    try {
      schedules = await ExamSchedule.find(query).sort({ examType: 1, className: 1 });
    } catch (dbErr) {
      console.warn('Schedules query failed, returning empty:', dbErr.message);
      schedules = [];
    }

    res.json({ success: true, count: schedules.length, data: schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.json({ success: true, count: 0, data: [] });
  }
});

// GET /api/schedules/years
router.get('/years', async (req, res) => {
  try {
    await connectDB();
    let years = [];
    try {
      years = await ExamSchedule.distinct('academicYear');
    } catch (e) {
      years = [];
    }
    if (!years || !years.length) {
      years = ["2026-2027"];
    }
    res.json({ success: true, count: years.length, data: years });
  } catch (error) {
    res.json({ success: true, count: 1, data: ["2026-2027"] });
  }
});

// POST /api/schedules (Protected)
router.post('/', protect, async (req, res) => {
  try {
    await connectDB();
    const { academicYear, className, examType, timingNote, instructions, timetable } = req.body;

    if (!academicYear || !className || !examType || !timetable || !timetable.length) {
      return res.status(400).json({ success: false, message: 'Please provide all required schedule fields and at least one timetable row.' });
    }

    const schedule = await ExamSchedule.findOneAndUpdate(
      { academicYear, className, examType },
      {
        academicYear,
        className,
        examType,
        timingNote: timingNote || `${examType} Assessment - ${className} Schedule`,
        instructions: instructions || [],
        timetable,
        updatedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/schedules/:id (Protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const schedule = await ExamSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.json({ success: true, message: 'Exam timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
