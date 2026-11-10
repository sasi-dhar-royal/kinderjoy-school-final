const mongoose = require('mongoose');

const VisitorCountSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'school_total'
  },
  count: {
    type: Number,
    required: true,
    default: 478
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.VisitorCount || mongoose.model('VisitorCount', VisitorCountSchema);

